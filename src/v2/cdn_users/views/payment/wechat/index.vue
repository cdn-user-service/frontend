<template>
  <el-dialog
    :title="
      antsT(
        isTokenpay
          ? `您正在支付 ${$root.webName} 在线${
              type === 'recharge' ? '充值' : '购买'
            }的 ${paywayConfig.name}`
          : paywayConfig.title
      )
    "
    :visible.sync="dialogVisible"
    @closed="closed"
    width="550px"
    :close-on-click-modal="false"
    :show-close="!isSuccess"
    append-to-body
    center
  >
    <ul class="space-y-8 p-lg rounded-2xl bg-ants-bg-4 -mt-lg">
      <li class="flex items-center">
        <span class="inline-block text-ants-text-4" style="width: 120px">{{
          antsT('收款商户')
        }}</span>
        <span>{{ contactInfo.company }}</span>
      </li>

      <li class="flex items-center">
        <span class="inline-block text-ants-text-4" style="width: 120px">{{
          antsT('商品订单')
        }}</span>
        <span>{{ order.outTradeNo }}</span>
      </li>
      <li class="flex items-center">
        <span class="inline-block text-ants-text-4" style="width: 120px">{{
          antsT('商品名称')
        }}</span>
        <span>{{ antsT(order.body) }}</span>
      </li>
      <li class="flex items-center">
        <span class="inline-block text-ants-text-4" style="width: 120px">{{
          antsT('支付金额')
        }}</span>
        <span class="text-price">
          <span class="text-4xl">
            <template v-if="isTokenpay">
              {{ tokenpayData.Amount }} {{ tokenpayData.CurrencyName }}
            </template>

            <template v-else>
              {{ order.totalAmount | priceFormat }}
            </template>
          </span>
        </span>
      </li>
    </ul>

    <div v-if="!isSuccess">
      <div
        class="relative mt-lg mx-auto border border-ants-border-2 rounded-2xl overflow-hidden"
        style="height: 200px; width: 200px"
        :class="{ 'p-df': !isTokenpay }"
        v-loading="loading"
      >
        <!-- 虚拟货币支付直接返回的就是base64图片，直接显示 -->
        <template v-if="isTokenpay">
          <img
            class="absolute"
            style="
              width: 26px;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "
            :src="paywayConfig.logo"
            alt="i"
          />

          <img
            class="w-full"
            v-show="qrText"
            :src="qrText"
            :alt="paywayConfig.name"
          />
        </template>

        <vue-qr
          v-else
          ref="qrRef"
          :text="qrText"
          :margin="0"
          colorDark="#262F3E"
          colorLight="#fefefe"
          :logoSrc="paywayConfig.logo"
          :logoScale="0.15"
          :size="180"
        />
      </div>
      <div class="text-center">
        <template v-if="isTokenpay && tokenpayData.ToAddress">
          <div class="mt-sm">
            <span class="font-" :style="{ color: paywayConfig.color }">
              {{ tokenpayData.ToAddress }}
            </span>
            <ants-copy :text="tokenpayData.ToAddress" icon />
          </div>
          <div class="text-sm mt-sm">
            过期时间：{{ tokenpayData.ExpireTime }}
          </div>
        </template>

        <span
          class="text-sm mt-df p-sm inline-block rounded-lg"
          style="color: #fefefe; min-width: 200px"
          :style="{ backgroundColor: paywayConfig.color }"
        >
          {{ antsT(paywayConfig.info) }}
        </span>
      </div>
    </div>

    <el-result
      v-else
      icon="success"
      :title="antsT('支付成功')"
      :subTitle="antsT('您已支付成功，请勿重复支付')"
    >
      <template slot="extra">
        <el-button type="success" size="small" @click="goBack"
          >{{ antsT('查看结果') }}
          {{ `${countDown} s` }}
        </el-button>
      </template>
    </el-result>
  </el-dialog>
</template>

<script>
// API
import {
  queryPayResult,
  wechatPay,
  alipay,
  stripePay,
  tokenPay,
  cccyunPay,
  allinpayPay
} from '@/v2/cdn_users/api/payment'
import vueQr from 'vue-qr'
import { isMobile } from '@/utils/env'
import paywayName from '@/global/payway'

export default {
  components: {
    vueQr
  },
  props: {
    backUrl: {
      type: String,
      default: '/cdn/finance/order/14'
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,

      // 监听支付状态定时器
      timer: null,
      // 是否支付成功
      isSuccess: false,
      // 支付成功返回页面倒计时
      countDown: 3,
      countTimer: null,

      // 订单信息
      order: {
        // 主要描述信息
        body: 'CDN商品',
        // 订单号
        outTradeNo: null,
        // 支付金额，以分为单位
        totalAmount: 0
      },
      // 支付方式
      payway: '',
      // 支付类型
      type: '',
      // 二维码信息
      qrText: '',
      // 是否为移动端
      isMobile: false,

      // 虚拟货币支付的信息需要显示
      tokenpayData: {
        // 支付地址
        ToAddress: '',
        // 过期时间
        ExpireTime: '',
        // 实际支付金额
        ActualAmount: 0,
        // 用于显示的支付金额，
        Amount: '',
        // 用于显示的支付金额单位
        CurrencyName: ''
      }
    }
  },
  computed: {
    contactInfo({ $root }) {
      return $root.webConfig.contact
    },

    // 是否为虚拟货币支付
    isTokenpay() {
      return this.payway.indexOf('tokenpay') != -1
    },

    // 当前支付方式及其配置
    paywayConfig() {
      return paywayName[this.payway] || {}
    }
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    // 清除定时器
    this.clearTimer()
    clearInterval(this.countTimer)
  },
  methods: {
    // 显示余额支付对话框
    showDialog({
      // 订单信息
      order = {},
      // 支付方式
      payway = '',
      // 支付类型：余额充值 = 'recharge' | 产品购买 = 'plan'
      type = ''
    }) {
      this.order = order
      this.payway = payway
      this.type = type
      this.isMobile = isMobile()

      switch (payway) {
        // 支付宝支付
        case 'alipay':
          this.doAlipay()
          break

        // 微信支付
        case 'wechat':
          this.doWechat()
          break

        // 通联支付
        case 'allinpay':
        case 'allinpay_wechat':
          this.doAllinpay()
          break

        // 虚拟货币支付
        case 'tokenpay':
        case 'tokenpay_ERC20':
        case 'tokenpay_ETH':
        case 'tokenpay_TRX':
          this.doTokenpay()
          break

        // 彩虹易支付
        case 'cccyun_wxpay':
        case 'cccyun':
        case 'cccyun_qqpay':
          this.doCccyun()
          break
      }
    },

    // 移动端支付跳转
    openMobile(url = '') {
      window.location.replace(
        url + '&redirect_url=' + encodeURIComponent(window.location.href)
      )
    },

    setLoading(loading = false) {
      if (this.isMobile) {
        // 移动端
        if (loading) {
          this.loading = this.$loading({
            lock: true,
            text: '加载中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.2)'
          })
        } else {
          this.loading.close()
        }
      } else {
        // PC端
        this.loading = loading
      }
    },

    // 支付宝支付
    doAlipay() {},

    // 微信支付
    async doWechat() {
      // PC端则打开对话框，移动端不打开
      this.dialogVisible = !this.isMobile
      this.setLoading(true)
      try {
        const { body, outTradeNo, totalAmount } = this.order

        const { data: res } = await wechatPay({
          // 移动端 = mweb | PC端 = native
          mode: this.isMobile ? 'mweb' : 'native',
          // 主要描述信息
          body,
          // 订单号
          outTradeNo,
          // 支付金额，以分为单位
          totalAmount
        })
        if (res.code !== 1) return

        if (this.isMobile) {
          // 移动端
          this.openMobile(res.data)
        } else {
          // PC端显示二维码
          this.qrText = res.data
          // 轮询查询支付结果
          this.setTimer()
        }
      } finally {
        this.setLoading(false)
      }
    },

    // 通联支付
    async doAllinpay() {
      // PC端则打开对话框，移动端不打开
      this.dialogVisible = !this.isMobile
      this.setLoading(true)
      try {
        const { outTradeNo } = this.order
        const payObj = {
          allinpay: 'alipay',
          allinpay_wechat: 'wechat'
        }

        const { data: res } = await allinpayPay({
          serialNumber: outTradeNo,
          payMethod: payObj[this.payway]
        })
        if (res.code !== 1) return

        const url = (res.data || {}).payinfo

        if (this.isMobile) {
          // 移动端
          this.openMobile(url)
        } else {
          // PC端显示二维码
          this.qrText = url
          // 轮询查询支付结果
          this.setTimer()
        }
      } finally {
        this.setLoading(false)
      }
    },

    // 虚拟货币支付
    async doTokenpay() {
      // PC端则打开对话框，移动端不打开
      this.dialogVisible = true
      this.loading = true

      try {
        const { outTradeNo } = this.order

        const usdtCurrent = {
          tokenpay: 'USDT_TRC20',
          tokenpay_TRX: 'TRX',
          tokenpay_ERC20: 'EVM_ETH_USDT_ERC20',
          tokenpay_ETH: 'EVM_ETH_ETH'
        }
        const { data: res } = await tokenPay({
          serialNumber: outTradeNo,
          current: usdtCurrent[this.payway]
        })
        if (res.code !== 1) return

        const info = (res.data || {}).info || {}
        const {
          QrCodeBase64,
          QrCodeLink,
          ToAddress,
          ExpireTime,
          ActualAmount,
          Amount,
          CurrencyName
        } = info

        // PC端显示二维码
        this.qrText = QrCodeBase64
        this.tokenpayData.ToAddress = ToAddress
        this.tokenpayData.ExpireTime = ExpireTime
        this.tokenpayData.ActualAmount = ActualAmount
        this.tokenpayData.Amount = Amount
        this.tokenpayData.CurrencyName = CurrencyName

        // 轮询查询支付结果
        this.setTimer()
      } finally {
        this.loading = false
      }
    },

    // 彩虹易支付
    async doCccyun() {
      // PC端则打开对话框，移动端不打开
      this.dialogVisible = !this.isMobile
      this.setLoading(true)
      try {
        const { outTradeNo } = this.order

        const payObj = {
          cccyun: 'alipay',
          cccyun_wxpay: 'wxpay',
          cccyun_qqpay: 'qqpay'
        }
        const { data: res } = await cccyunPay({
          serialNumber: outTradeNo,
          payMethod: payObj[this.payway]
        })
        if (res.code !== 1) return

        const obj = JSON.parse(res.data || '{}')
        // 第三方返回的 qrcode | payurl 跟支付方式不一致！！需要统一处理
        const trueUrl = obj.qrcode || obj.payurl || ''

        if (trueUrl.indexOf('http') === -1) {
          return this.$msg.error('返回数据异常')
        }

        if (this.isMobile) {
          // 移动端
          this.openMobile(trueUrl)
        } else {
          // PC端显示二维码
          this.qrText = trueUrl
          // 轮询查询支付结果
          this.setTimer()
        }
      } finally {
        this.setLoading(false)
      }
    },

    // 轮询查询支付结果
    async queryResult() {
      let repeat = 200 // 限制执行次数为200次,时长为10分钟
      if (repeat == 0) {
        // 支付超时
        this.$msg.error(this.antsT('支付超时'))
        this.dialogVisible = false
      } else {
        const { data: res } = await queryPayResult({
          SerialNumber: this.order.outTradeNo
        })

        // 请求数据异常
        if (res.code !== 1) {
          this.dialogVisible = false
          return
        }

        const obj = res.data || {}

        // status = 14 支付成功，显示支付成功页面
        if (obj.status == 14) {
          // 显示支付成功页面
          this.isSuccess = true
          this.$msg.success(this.antsT('支付成功'))
          this.clearTimer()
          this.timeOut()
          return
        }

        // status != 10 如果状态不为待支付，即异常订单，则返回
        if (obj.status != 10) {
          this.dialogVisible = false
          this.router.replace('/cdn/finance/order')
          this.$msg.info(this.antsT('订单已关闭'))
        }
      }
      repeat--
    },

    setTimer() {
      this.clearTimer()
      this.queryResult()
      this.timer = setTimeout(this.setTimer, 3 * 1000)
    },

    // 清除定时器
    clearTimer() {
      clearTimeout(this.timer)
    },

    // 支付成功倒计时，关闭页面
    timeOut() {
      this.countDown = 3
      this.countTimer = setInterval(() => {
        this.countDown--

        if (this.countDown === 0) {
          clearInterval(this.countTimer)
          this.goBack()
        }
      }, 1000)
    },

    /**
     * @description: 支付成功后返回查看结果页面
     */

    goBack() {
      this.dialogVisible = false
      this.$router.replace(this.backUrl)
      // 支付成功后的，回调函数
      this.$emit('refresh')
    },

    // 清除二维码信息
    clearQr() {
      this.qrText = ''
      if (this.$refs.qrRef) {
        this.$refs.qrRef.$el.src = ''
      }
    },

    // 对话框关闭
    closed() {
      this.isSuccess = false
      // 清除定时器
      this.clearTimer()
      clearInterval(this.countTimer)
      // 清除二维码信息
      this.clearQr()
      this.tokenpayData.ToAddress = ''
      this.tokenpayData.ExpireTime = ''
      this.tokenpayData.Amount = ''
      this.tokenpayData.CurrencyName = ''
    }
  }
}
</script>
