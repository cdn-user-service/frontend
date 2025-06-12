<template>
  <div class="recahrge-box">
    <div class="content-box animated fadeIn">
      <ul class="ants-tips_box space-y-2">
        <li>
          <span class="el-icon-warning"></span>
          {{
            antsT(`充值最小金额 ${$root.priceUnit}5.00，充值金额必须为整数；`)
          }}
        </li>
        <li>
          <span class="el-icon-warning"></span>
          {{
            antsT(
              '支付过程中浏览器会有几次跳转，支付完成之前请勿关闭浏览器，否则可能造成支付失败；'
            )
          }}
        </li>
        <li>
          <span class="el-icon-warning"></span>
          {{ antsT('如充值后款项没有到账，请联系我们。') }}
        </li>
      </ul>
    </div>

    <el-card class="content-box animated fadeIn">
      <ul class="md:px-lg">
        <li style="color: #a3b1cc" class="flex items-center mb-lg">
          <span class="aicon icon-yue1 text-4xl"></span>
          <span class="text-3xl font-bold ml-sm">{{ antsT('可用余额') }}</span>
        </li>
        <li class="font-bold text-price">
          <span
            class="text-4xl"
            v-loading="loading"
            element-loading-spinner="el-icon-loading"
            >{{ $root.userinfo.propertyBalance | priceFormat }}</span
          >
          <span
            class="ml-lg font-normal cursor-pointer el-icon-refresh"
            @click="getUserinfo()"
            style="color: #a3b1cc; font-size: 16px"
          >
          </span>
        </li>
      </ul>
    </el-card>

    <el-card class="content-box sumit_box">
      <ul class="md:px-lg">
        <li style="color: #a3b1cc" class="flex items-center pb-lg">
          <span class="aicon icon-weibiaoti-- text-4xl"></span>
          <span class="text-3xl font-bold ml-sm">{{ antsT('在线充值') }}</span>
        </li>
        <li class="my-lg mt-sm">
          <TitleBorder title="充值金额" class="mb-sm" />
          <div class="recharge-radio-box">
            <ants-radio-group
              v-model="prices"
              size="medium"
              @change="changePrices"
            >
              <ants-radio
                border
                v-for="item in [100000, 200000, 500000, 1000000]"
                :key="item"
                :label="item"
                :text="item | priceFormat"
              />
            </ants-radio-group>
            <div>
              <el-input
                v-model="inputPrices"
                type="number"
                style="width: 227px"
                :placeholder="antsT('其他金额')"
                @focus="inputFocus"
                @input="nowPrices"
              />
              {{ $root.priceUnit }}
            </div>
          </div>
        </li>
        <li class="my-lg pb-df">
          <TitleBorder title="支付方式" class="mb-lg" />
          <el-radio-group v-model="activePayway">
            <el-radio
              border
              v-for="key in showPayways"
              :key="key"
              :label="key"
              :class="`${key}-radio`"
              class="payway-radio"
            >
              <div class="flex items-center justify-between h-full pr-2">
                <strong>
                  {{ paywayName[key].name }}
                </strong>
                <span
                  style="font-size: 30px"
                  :style="{
                    color: paywayName[key].color,
                    margin: key == 'stripe_apple' ? '0 -10px' : 0
                  }"
                  :class="paywayName[key].icon"
                />
              </div>
            </el-radio>
          </el-radio-group>
          <strong class="text-error" v-if="!showPayways.length">{{
            antsT('请联系管理员开启充值通道！')
          }}</strong>
        </li>
        <li class="my-lg">
          <TitleBorder title="核对订单" class="mb-sm" />
          <div class="mt-lg mb-sm">
            {{ antsT('实付：')
            }}<span class="font-bold text-3xl text-price">{{
              payPrice | priceFormat
            }}</span>
          </div>
          <div>
            <ants-button
              size="medium"
              type="primary"
              @click="toRecharge"
              :loading="btnLoading"
              :disabled="!showPayways.length"
              class="px-3xl"
              style="padding: 10px 46px"
              :text="btnLoading ? '处理中...' : '提交订单'"
            />
            <span class="text-sm text-ants-text-4 ml-sm">{{
              antsT('温馨提示：支付成功之后五分钟内到账。')
            }}</span>
          </div>
        </li>
      </ul>
    </el-card>

    <el-dialog
      :title="antsT('友情提示')"
      :visible.sync="isAlipaySuccess"
      width="450px"
      @close="refreshBalance"
      center
    >
      <el-result
        class="-mt-lg -mb-lg"
        icon="success"
        :title="antsT('我已经完成支付？')"
        :subTitle="antsT('现在可前往 “支付记录” 页面查看')"
      >
      </el-result>
      <span slot="footer">
        <ants-button
          type="primary"
          size="small"
          @click="backCheck"
          text="查看记录"
        />
        <ants-button
          type="success"
          size="small"
          @click="refreshBalance"
          text="刷新余额"
        />
      </span>
    </el-dialog>

    <!-- 微信扫码支付对话框 -->
    <WechatPayDialog
      ref="WechatPayDialogRef"
      back-url="/dns/finance/recharge"
      @refresh="resetData"
    />
  </div>
</template>

<script>
// api
import {
  stripePay,
  tokenPay,
  cccyunPay,
  allinpayPay
} from '@/v2/dns_users/api/payment'
import { recharge } from '@/v2/dns_users/api/dns/finance'
import WechatPayDialog from '@/v2/dns_users/views/payment/wechat'
import paywayName from '@/global/payway'
import { openUrl } from '@/utils/env'

export default {
  components: {
    WechatPayDialog
  },
  data() {
    return {
      paywayName,
      loading: false,
      btnLoading: false,
      // 支付宝支付成功后弹出
      isAlipaySuccess: false,
      // 当前选中支付方式
      activePayway: '',
      // 选择的金额
      prices: 0,
      // 输入的金额
      inputPrices: null,
      // 显示的金额，实际支付的金额
      payPrice: 0
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
    // 显示已开启的支付方式
    showPayways() {
      const payways = []
      Object.keys(this.powerObj).forEach((key) => {
        if (!this.powerObj[key]) return
        payways.push(key)
        if (key === 'stripe') {
          // payways.push('stripe_wechat', 'stripe_apple')
          payways.push('stripe_other')
        }

        if (key === 'allinpay') {
          payways.push('allinpay_wechat')
        }

        if (key === 'tokenpay') {
          payways.push('tokenpay_ERC20', 'tokenpay_ETH')
        }

        if (key === 'cccyun') {
          payways.push('cccyun_wxpay', 'cccyun_qqpay')
        }
      })
      return payways
    }
  },
  watch: {
    powerObj: function (newVal) {
      this.setPayway()
    }
  },
  created() {
    this.setPayway()
    // 获取用户信息
    this.getUserinfo()
  },
  mounted() {},
  methods: {
    // 获取用户余额
    async getUserinfo() {
      this.loading = true
      await this.$root.getUserinfo()
      this.loading = false
    },

    // 设置默认选中支付方式
    setPayway() {
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

    // 点击立即购买
    async toRecharge() {
      // 如果管理员没有打开充值通道
      if (!this.showPayways.length) {
        return this.$msg.error(this.antsT('暂不能充值，请联系客服解决！'))
      }

      // 如果没有选择金额
      if (this.payPrice <= 0) {
        return this.$msg.warning(this.antsT('请选择或输入您要充值的金额！'))
      }

      if (!this.activePayway) {
        return this.$msg.error(this.antsT('请选择支付方式'))
      }

      // stripe支付 金额不能小于 5
      if (this.payPrice < 500) {
        return this.$msg.error(`充值金额不能小于 ${this.$root.priceUnit}5`)
      }

      // 已开启的支付方式
      const { alipay, wechat, stripe, tokenpay, cccyun, allinpay } = this.powerObj

      // 余额充值创建订单
      const orderInfo = await this.createOrder()
      if (!orderInfo) return

      // 微信支付，弹出微信扫码支付对话框
      if (this.activePayway === 'wechat' && wechat) {
        this.payByWechat(orderInfo)
      }

      // 支付宝支付，前往支付宝扫码支付页面
      if (this.activePayway === 'alipay' && alipay) {
        this.payByAlipay(orderInfo)
      }

      // stripe支付
      if (this.activePayway.indexOf('stripe') !== -1 && stripe) {
        this.payByStripe(orderInfo)
      }

      // 通联支付
      if (this.activePayway.indexOf('allinpay') !== -1 && allinpay) {
        this.payByAllinpay(orderInfo)
      }

      // TokenPay支付
      if (this.activePayway.indexOf('tokenpay') !== -1 && tokenpay) {
        this.payByTokenPay(orderInfo)
      }

      // 彩虹易支付
      if (this.activePayway.indexOf('cccyun') !== -1 && cccyun) {
        this.payByCccyun(orderInfo)
      }
    },

    // 余额充值，创建订单
    async createOrder() {
      this.btnLoading = true
      try {
        const { data: res } = await recharge({
          sum: this.payPrice
        })
        if (res.code !== 1) return false

        const obj = res.data || {}
        // 订单信息
        return {
          // 购买类型信息用于支付时展示的
          body: '余额充值',
          // 订单号
          outTradeNo: obj.orderId,
          // 支付金额，以分为单位
          totalAmount: obj.buyPayable
        }
      } catch (err) {
        console.log(err)
        return false
      } finally {
        this.btnLoading = false
      }
    },

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
      this.isAlipaySuccess = true
      this.resetData()
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
        setTimeout(() => {
          this.isAlipaySuccess = true
          this.resetData()
        }, 1000)
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
        console.log('tonglian支付', res)
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
        setTimeout(() => {
          this.isAlipaySuccess = true
          this.resetData()
        }, 1000)
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
          setTimeout(() => {
            this.isAlipaySuccess = true
            this.resetData()
          }, 1000)
        }

        // QQ钱包
        if (this.activePayway === 'cccyun_qqpay') {
        }
      } finally {
        this.btnLoading = false
      }
    },

    // 支付宝支付成功后，点击返回
    backCheck() {
      this.isAlipaySuccess = false
      this.$router.replace('/dns/finance/order')
    },

    // 支付宝支付成功后，点击刷新余额
    refreshBalance() {
      this.getUserinfo()
      this.isAlipaySuccess = false
    },

    // 重置数据
    resetData() {
      this.getUserinfo()
      this.prices = 0
      this.payPrice = 0
      this.inputPrices = null
    },

    // 点击其他金额输入框
    inputFocus() {
      this.prices = 0
      this.payPrice = (this.inputPrices || 0) * 100
    },

    // 输入其他金额
    nowPrices(val) {
      this.payPrice = val * 100
    },

    // 选择固定金额
    changePrices(val) {
      this.inputPrices = null
      this.payPrice = val
    }
  }
}
</script>

<style lang="scss">
.recahrge-box {
  .recharge-radio-box {
    padding: 10px 0;
    .ants-radio {
      margin-right: 15px;
      margin-bottom: 15px;
    }
    .ants-radio.is-bordered + .ants-radio.is-bordered {
      margin-left: 0;
    }
  }

  .el-radio__label {
    font-weight: 600;
    padding-left: 6px;
  }

  .payway-radio {
    min-width: 140px;
    margin-right: 5px;
    padding-top: 0;
    .el-radio__label {
      font-weight: 400;
      display: inline-block;
      width: 100%;
      height: 100%;
    }
  }

  // .payway-radio {
  //   width: 150px;
  //   margin-right: 5px;

  //   &.wechat-radio {
  //     background: url('~@/assets/img/wechat-icon.png') no-repeat 105px;
  //   }
  //   &.alipay-radio {
  //     background: url('~@/assets/img/alipay-icon.png') no-repeat 105px;
  //   }
  //   &.stripe-radio {
  //     background: url('~@/assets/img/pay.png') no-repeat 105px;
  //     background-size: 30px;
  //   }
  //   &.tokenpay-radio {
  //     width: 180px;
  //     background: url('~@/assets/img/usdt.png') no-repeat 140px;
  //     background-size: 28px;
  //   }
  //   &.tokenpay_TRX-radio {
  //     background: url('~@/assets/img/trx.png') no-repeat 105px;
  //     background-size: 28px;
  //   }
  //   &.tokenpay_ERC20-radio {
  //     width: 180px;
  //     background: url('~@/assets/img/erc20.png') no-repeat 140px;
  //     background-size: 28px;
  //   }
  //   &.tokenpay_ETH-radio {
  //     background: url('~@/assets/img/eth.png') no-repeat 105px;
  //     background-size: 28px;
  //   }
  // }
}
</style>
