<template>
  <el-dialog
    :title="antsT(payway === 'alipay' ? '支付宝扫码支付' : '微信扫码支付')"
    :visible.sync="dialogVisible"
    @close="resetDialog"
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
        <span>{{ orderData.outTradeNo }}</span>
      </li>
      <li class="flex items-center">
        <span class="inline-block text-ants-text-4" style="width: 120px">{{
          antsT('商品名称')
        }}</span>
        <span>{{ antsT(orderData.body) }}</span>
      </li>
      <li class="flex items-center">
        <span class="inline-block text-ants-text-4" style="width: 120px">{{
          antsT('支付金额')
        }}</span>
        <span class="text-price">
          <span class="text-4xl">
            {{ orderData.totalAmount | priceFormat }}
          </span>
        </span>
      </li>
    </ul>

    <div v-if="!isSuccess">
      <div
        class="mt-lg mx-auto p-df border border-ants-border-2 rounded-2xl overflow-hidden"
        style="height: 200px; width: 200px"
        v-loading="loading"
      >
        <vue-qr
          ref="qrRef"
          :text="wechatCodeData.url"
          :margin="0"
          colorDark="#262F3E"
          colorLight="#fefefe"
          :logoSrc="wechatCodeData[`${payway}-icon`]"
          :logoScale="0.15"
          :size="180"
        />
      </div>
      <div class="text-center">
        <span
          class="qr_info text-sm mt-df p-sm inline-block rounded-lg"
          style="color: #fefefe"
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
import { wechatPay, queryPayResult } from '@/v2/cdn_users/api/payment'
import vueQr from 'vue-qr'
import { isMobile } from '@/utils/env'
import paywayName from '@/global/payway'
const { alipay, wechat } = paywayName

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

      // 微信支付二维码信息
      wechatCodeData: {
        url: '',
        'wechat-icon': require('@/assets/img/wechat-icon.png'),
        'alipay-icon': require('@/assets/img/alipay-icon.png')
      },
      // 监听支付状态定时器
      timer: null,
      // 是否支付成功
      isSuccess: false,
      // 支付成功返回页面倒计时
      countDown: 3,
      countTimer: null,

      // 订单信息
      orderData: {
        // 主要描述信息
        body: 'CDN商品',
        // 订单号
        outTradeNo: null,
        // 支付金额，以分为单位
        totalAmount: 0
      },

      // 微信支付 = wechat | 支付宝 = alipay
      payway: 'wechat'
    }
  },
  computed: {
    contactInfo({ $root }) {
      return $root.webConfig.contact
    },

    // 支付方式显示
    paywayConfig() {
      return this.payway === 'alipay' ? alipay : wechat
    }
  },
  created() {},
  mounted() {},
  destroyed() {
    this.clearTimer()
  },
  methods: {
    // 显示余额支付对话框
    showDialog(orderData = {}, qrcode = '', payway = '') {
      this.orderData = orderData
      this.isSuccess = false
      this.payway = 'wechat'

      // 如果为通联支付；包括微信支付和支付宝支付
      if (payway) {
        this.payway = payway || 'wechat'
        this.payByAllinpay(qrcode)
        return
      }

      // 如果为彩虹易支付-微信支付
      if (qrcode) {
        this.dialogVisible = true
        // 生成二维码
        this.wechatCodeData.url = qrcode
        // 轮询查询支付结果
        this.setTimer()
        return
      }

      // 如果为移动端H5支付
      if (isMobile()) {
        this.wxpayByMweb()
        return
      }

      // 如果为 PC 端
      this.dialogVisible = true
      this.getWechatCode()
    },

    // 通联支付
    payByAllinpay(qrcode) {
      // 移动端支付
      if (isMobile()) {
        window.location.replace(
          qrcode + '&redirect_url=' + encodeURIComponent(window.location.href)
        )
        return
      }

      // PC端
      this.dialogVisible = true
      // 生成二维码
      this.wechatCodeData.url = qrcode
      // 轮询查询支付结果
      this.setTimer()
    },

    // 微信移动端支付
    async wxpayByMweb() {
      const loading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.2)'
      })

      const { body, outTradeNo, totalAmount } = this.orderData

      const { data: res } = await wechatPay({
        mode: 'mweb',
        body,
        outTradeNo,
        totalAmount
      })
      loading.close()

      if (res.code !== 1) return

      window.location.replace(
        res.data + '&redirect_url=' + encodeURIComponent(window.location.href)
      )
    },

    // 获取微信支付二维码
    async getWechatCode() {
      this.loading = true
      const { body, outTradeNo, totalAmount } = this.orderData

      const { data: res } = await wechatPay({
        // 不同客户端支付方式(native = pc 端 || mweb = 移动端)
        mode: 'native',
        // 主要描述信息
        body,
        // 订单号
        outTradeNo,
        // 支付金额，以分为单位
        totalAmount
      })
      this.loading = false

      if (res.code !== 1) return

      // 生成二维码
      this.wechatCodeData.url = res.data

      // 轮询查询支付结果
      this.setTimer()
    },

    // 轮询查询支付结果
    async queryPayResultData() {
      let repeat = 200 // 限制执行次数为200次,时长为10分钟
      if (repeat == 0) {
        // 支付超时
        this.$msg.error(this.antsT('支付超时'))
        this.dialogVisible = false
      } else {
        const { data: res } = await queryPayResult({
          SerialNumber: this.orderData.outTradeNo
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
      this.queryPayResultData()
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
      this.wechatCodeData.url = ''
      if (this.$refs.qrRef) {
        this.$refs.qrRef.$el.src = ''
      }
    },

    // 对话框关闭
    resetDialog() {
      // 清除定时器
      this.clearTimer()
      clearInterval(this.countTimer)
      // 清除二维码信息
      this.clearQr()
    }
  }
}
</script>
