<template>
  <div>
    <el-card>
      <TitleBorder title="支付方式" />
      <div v-loading="loading">
        <ul class="">
          <li
            class="payway-wrap cursor-color rounded-2xl bg-ants-bg-2 my-lg overflow-hidden"
            v-for="(item, key) in showPayways"
            :key="key"
            :class="{
              'payway-active': activePayway === key,
              'payway-disabled': item.disabled
            }"
            @click="changePayway(key, item.disabled)"
          >
            <span class="el-icon-check" v-show="activePayway === key"></span>

            <div
              class="payway-item flex items-center overflow-hidden px-lg rounded-2xl bg-ants-bg-2"
            >
              <div style="min-width: 50px">
                <span
                  :class="item.icon"
                  :style="{
                    color: item.color,
                    'margin-left': key == 'stripe_apple' ? '-10px' : 0
                  }"
                ></span>
              </div>
              <div>
                <div class="mb-xs font-bold text-ants-text-3">
                  {{ antsT(item.name) }}
                </div>
                <div
                  class="text-sm text-ants-text-4 truncate"
                  v-html="antsT(item.info)"
                ></div>
              </div>
            </div>
          </li>
        </ul>

        <div class="">
          <div class="flex items-center justify-between mb-df">
            <span class="text-ants-text-3 font-semibold"
              >{{ antsT('合计费用') }}：</span
            >
            <div class="text-price font-semibold">
              <span class="text-4xl">{{
                orderData.payable | priceFormat
              }}</span>
            </div>
          </div>

          <ants-button
            style="width: 100%"
            type="warning"
            class="ants-price-button"
            @click="submitOrder"
            :disabled="$root.loading || loading"
            :loading="btnLoading"
            :text="btnLoading ? '处理中...' : '确认支付'"
          />
        </div>
      </div>
    </el-card>

    <!-- 余额支付对话框 -->
    <BalancePayDialog
      ref="BalancePayDialogRef"
      :balance="propertyBalance"
      :buyPayable="orderData.payable"
    />

    <!-- 微信扫码支付对话框 -->
    <WechatPayDialog
      ref="WechatPayDialogRef"
      back-url="/cdn/finance/order"
      @refresh="refreshData"
    />

    <!-- 支付宝支付成功对话框 -->
    <SuccessDialog ref="SuccessDialogRef" />
  </div>
</template>

<script>
// API
import {
  stripePay,
  tokenPay,
  cccyunPay,
  allinpayPay
} from '@/v2/cdn_users/api/payment'
// 组件
import BalancePayDialog from './BalancePayDialog'
import WechatPayDialog from '../../../wechat'
import SuccessDialog from './SuccessDialog'
import { openUrl } from '@/utils/env'
import { priceFormatFun } from '@/utils/public'
import paywayName from '@/global/payway'

paywayName.balance = {
  name: '余额支付',
  info: '可用余额 0.00',
  icon: 'aicon icon-lefenzhuanyue',
  color: '#177DFF'
}

export default {
  components: {
    BalancePayDialog,
    WechatPayDialog,
    SuccessDialog
  },
  props: {
    // 订单数据
    orderData: Object
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      // 当前选中支付方式，置为空，动态赋值
      activePayway: '',
      // 用户可用余额
      propertyBalance: 0
    }
  },
  computed: {
    // 后台开启了哪些支付方式
    powerObj({ $root }) {
      const {
        WXPAY_CONFIG_KEY: wechat,
        ALIPAY_CONFIG_KEY: alipay,
        STRIPE_PAY_CONF: stripe,
        TOKEN_PAY_CONF: tokenpay,
        CCCYUN_PAY_CONF: cccyun,
        ALLINPAY_PAY_CONF: allinpay
      } = $root.powerObj
      return { wechat, alipay, stripe, tokenpay, cccyun, allinpay }
    },
    showPayways() {
      const obj = {}
      obj.balance = paywayName.balance
      // 显示余额
      obj.balance.info = `${this.antsT('可用余额')} <strong>${priceFormatFun(
        this.propertyBalance
      )}</strong>`
      // 是否禁用余额支付
      obj.balance.disabled = this.propertyBalance < this.orderData.payable
      // 过滤未开启的支付方式
      Object.keys(paywayName).forEach((key) => {
        if (!this.powerObj[key]) return
        obj[key] = paywayName[key]
        if (key === 'stripe') {
          // obj.stripe_wechat = paywayName.stripe_wechat
          // obj.stripe_apple = paywayName.stripe_apple
          obj.stripe_other = paywayName.stripe_other
        }

        if (key === 'allinpay') {
          obj.allinpay_wechat = paywayName.allinpay_wechat
        }

        if (key === 'tokenpay') {
          obj.tokenpay_ERC20 = paywayName.tokenpay_ERC20
          obj.tokenpay_ETH = paywayName.tokenpay_ETH
        }

        if (key === 'cccyun') {
          obj.cccyun_wxpay = paywayName.cccyun_wxpay
          obj.cccyun_qqpay = paywayName.cccyun_qqpay
        }
      })

      console.log('----', obj)
      return obj
    }
  },
  watch: {
    powerObj: function (newVal) {
      this.setPayway()
    }
  },
  created() {
    this.getUserinfo()
  },
  methods: {
    // 获取用户余额，判断余额支付是否可用
    async getUserinfo() {
      this.loading = true
      try {
        const userinfo = await this.$root.getUserinfo()
        // 用户余额
        this.propertyBalance = userinfo.propertyBalance || 0
        // 设置选中支付方式
        this.setPayway()
      } finally {
        this.loading = false
      }
    },

    // 设置默认选中支付方式
    setPayway() {
      // 如果余额大于订单金额，默认选择余额支付
      if (this.propertyBalance >= this.orderData.payable) {
        this.activePayway = 'balance'
        return
      }
      const { wechat, alipay, stripe, tokenpay, cccyun, allinpay } =
        this.powerObj
      this.activePayway = wechat
        ? 'wechat'
        : alipay
        ? 'alipay'
        : allinpay
        ? 'allinpay'
        : stripe
        ? 'stripe'
        : tokenpay
        ? 'tokenpay'
        : cccyun
        ? 'cccyun'
        : ''
    },

    // 切换支付方式
    changePayway(key, disabled) {
      if (disabled) return
      this.activePayway = key
    },

    // 提交订单
    submitOrder() {
      // 如果管理员没有打开充值通道
      if (!Object.keys(this.showPayways).length) {
        return this.$msg.error(this.antsT('暂不能支付，请联系客服解决！'))
      }

      if (!this.activePayway) return this.$msg.error('请选择支付方式')

      // 余额支付，弹出支付密码对话框
      if (this.activePayway === 'balance') {
        this.payByBalance()
        return
      }

      // 开启了哪些支付功能
      const { wechat, alipay, stripe, tokenpay, cccyun, allinpay } =
        this.powerObj

      // 订单信息
      const orderInfo = {
        // 购买类型信息用于支付时展示的
        body: 'CDN套餐购买',
        // 订单号
        outTradeNo: this.orderData.serialNumber,
        // 支付金额，以分为单位
        totalAmount: this.orderData.payable
      }

      // 支付宝支付，前往支付宝扫码支付页面
      if (this.activePayway === 'alipay' && alipay) {
        this.payByAlipay(orderInfo)
      }

      // stripe支付
      if (this.activePayway.indexOf('stripe') !== -1 && stripe) {
        this.payByStripe(orderInfo)
      }

      // 微信支付，弹出微信扫码支付对话框
      if (this.activePayway === 'wechat' && wechat) {
        this.toQrcodePay(orderInfo)
      }

      // 通联支付
      if (this.activePayway.indexOf('allinpay') !== -1 && allinpay) {
        this.toQrcodePay(orderInfo)
      }

      // TokenPay支付
      if (this.activePayway.indexOf('tokenpay') !== -1 && tokenpay) {
        this.toQrcodePay(orderInfo)
      }

      // 彩虹易支付
      if (this.activePayway.indexOf('cccyun') !== -1 && cccyun) {
        this.toQrcodePay(orderInfo)
      }
    },

    // 打开对话框进行扫码支付
    async toQrcodePay(orderInfo = {}) {
      this.$refs.WechatPayDialogRef.showDialog({
        order: orderInfo,
        payway: this.activePayway,
        type: 'plan'
      })
    },

    // 余额支付
    payByBalance() {
      this.$refs.BalancePayDialogRef.showDialog(this.orderData.serialNumber)
    },

    refreshData() {},

    // 微信支付
    async payByWechat(orderInfo = {}) {
      this.$refs.WechatPayDialogRef.showDialog(orderInfo)
    },

    // 支付宝支付
    async payByAlipay(orderInfo = {}) {
      const ROUTER_DATA = this.$router.resolve({
        name: 'Alipay',
        params: orderInfo
      })
      window.open(ROUTER_DATA.href, '_blank')
      // 显示支付成功对话框
      this.$refs.SuccessDialogRef.isAlipaySuccess = true
    },

    // Stripe支付
    async payByStripe(orderInfo = {}) {
      this.btnLoading = true
      try {
        const { data: res } = await stripePay({
          serialNumber: orderInfo.outTradeNo,
          payMethod: this.activePayway == 'stripe' ? 'alipay' : ''
        })
        if (res.code !== 1) return
        const url = (res.data || {}).url
        // 打开新的页面
        openUrl(url, true)
        // 显示支付成功对话框
        this.$refs.SuccessDialogRef.isAlipaySuccess = true
      } finally {
        this.btnLoading = false
      }
    },

    // 通联支付
    async payByAllinpay(orderInfo = {}) {
      this.btnLoading = true
      try {
        const payObj = {
          allinpay: 'alipay',
          allinpay_wechat: 'wechat'
        }
        const payway = payObj[this.activePayway]
        const { data: res } = await allinpayPay({
          serialNumber: orderInfo.outTradeNo,
          payMethod: payway
        })
        if (res.code !== 1) return
        const url = (res.data || {}).payinfo

        // 微信支付-支付宝支付
        this.$refs.WechatPayDialogRef.showDialog(orderInfo, url, payway)
      } finally {
        this.btnLoading = false
      }
    },

    // TokenPay 支付
    async payByTokenPay(orderInfo = {}) {
      this.btnLoading = true
      const usdtCurrent = {
        tokenpay: 'USDT_TRC20',
        tokenpay_TRX: 'TRX',
        tokenpay_ERC20: 'EVM_ETH_USDT_ERC20',
        tokenpay_ETH: 'EVM_ETH_ETH'
      }
      try {
        const { data: res } = await tokenPay({
          serialNumber: orderInfo.outTradeNo,
          current: usdtCurrent[this.activePayway]
        })
        if (res.code !== 1) return
        const url = (res.data || {}).data
        // 打开新的页面
        openUrl(url, true)
        // 显示支付成功对话框
        this.$refs.SuccessDialogRef.isAlipaySuccess = true
      } finally {
        this.btnLoading = false
      }
    },

    // 彩虹易支付
    async payByCccyun(orderInfo = {}) {
      this.btnLoading = true
      const payObj = {
        cccyun: 'alipay',
        cccyun_wxpay: 'wxpay',
        cccyun_qqpay: 'qqpay'
      }
      try {
        const { data: res } = await cccyunPay({
          serialNumber: orderInfo.outTradeNo,
          payMethod: payObj[this.activePayway]
        })
        if (res.code !== 1) return
        const obj = JSON.parse(res.data || '{}')
        console.log(obj)

        // 第三方返回的 qrcode | payurl 跟支付方式不一致！！需要统一处理
        const trueUrl = obj.qrcode || obj.payurl || ''

        if (trueUrl.indexOf('http') === -1) {
          return this.$msg.error('返回数据异常')
        }

        // 微信支付
        if (this.activePayway === 'cccyun_wxpay') {
          this.$refs.WechatPayDialogRef.showDialog(orderInfo, trueUrl)
        }

        // 支付宝支付
        if (
          this.activePayway === 'cccyun' ||
          this.activePayway === 'cccyun_qqpay'
        ) {
          openUrl(trueUrl, true)
          // 显示支付成功对话框
          this.$refs.SuccessDialogRef.isAlipaySuccess = true
        }

        // QQ钱包
        if (this.activePayway === 'cccyun_qqpay') {
        }
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.payway-wrap {
  position: relative;
  padding: 2px;
  .el-icon-check {
    position: absolute;
    bottom: 2px;
    right: 2px;
    z-index: 9;
    color: #fefefe;
    font-size: 15px;
    font-weight: 600;
  }

  .payway-item {
    padding-top: 15px;
    padding-bottom: 15px;
    transition: all 0.3s;
    .aicon {
      font-size: 32px;
    }
  }

  &:hover {
    box-shadow: -1px 3px 6px rgba(0, 0, 0, 0.2);
    div {
      color: theme('colors.primary');
    }
  }

  // 选中状态
  &.payway-active {
    background-color: theme('colors.primary');
    .payway-item {
      border-radius: 8px;
    }
    div {
      color: theme('colors.primary');
    }
    &::after {
      content: '';
      height: 35px;
      width: 35px;
      background: theme('colors.primary');
      position: absolute;
      bottom: -15px;
      right: -15px;
      transform: rotate(45deg);
    }
  }

  // 禁用状态
  &.payway-disabled {
    background-color: theme('colors.ants-bg-5');
    cursor: not-allowed;
    .payway-item {
      background-color: theme('colors.ants-bg-5');
    }
    div {
      color: theme('colors.ants-text-5');
    }
    &:hover {
      box-shadow: none;
    }
  }
}
</style>
