<template>
  <div class="verification-box">
    <el-skeleton :rows="8" :loading="$root.loading" animated>
      <template>
        <!-- 已认证过的 start -->
        <Verified v-if="isVerified" ref="VerifiedRef" />

        <!-- 未认证的 start -->
        <div v-else>
          <ul class="ants-tips_box content-box space-y-3">
            <li>
              <span class="el-icon-info"></span>
              {{
                antsT(
                  '根据相关法规和政策要求，必须完成账号实名认证才能使用相关功能。'
                )
              }}
            </li>
            <li>
              <span class="el-icon-info"></span>
              {{ antsT('请尽快完成实名认证，否则可能会影响部分功能的使用。') }}
            </li>
          </ul>
          <el-card class="content-box">
            <div class="verify-steps_box">
              <el-steps :active="+activeStep" align-center simple>
                <el-step
                  icon="aicon icon-xuhao_11"
                  :title="antsT('扫码支付认证费用')"
                >
                </el-step>
                <el-step
                  icon="aicon icon-xuhao_2"
                  :title="antsT('人身核验认证')"
                ></el-step>
                <el-step
                  icon="aicon icon-xuhao_31"
                  :title="antsT('认证完成')"
                ></el-step>
              </el-steps>
            </div>

            <el-tabs v-model="activeStep">
              <!-- 第一步：填写姓名、身份证号，获取支付订单，根据订单号生成支付二维码，进行支付 start -->
              <el-tab-pane name="1">
                <Step1
                  v-if="activeStep == 1"
                  ref="Step1Ref"
                  @checkResult="checkResult"
                  @clearTimer="clearTimer"
                />
              </el-tab-pane>

              <!-- 第二步：支付成功，根据返回的支付订单生成实名二维码，进行实名 start-->
              <el-tab-pane name="2">
                <Step2 v-if="activeStep == 2" @checkResult="checkResult" />
              </el-tab-pane>

              <!-- 第三步：实名成功，显示实名信息 start-->
              <el-tab-pane name="3">
                <Step3 v-if="activeStep == 3" ref="Step3Ref" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script>
// API
import { authStatus } from '@/v2/dns_users/api/dns/account'
import Verified from './components/Verified'
import Step1 from './components/Step-1'
import Step2 from './components/Step-2'
import Step3 from './components/Step-3'

export default {
  components: {
    Verified,
    Step1,
    Step2,
    Step3
  },
  data() {
    return {
      // 是否已实名
      isVerified: false,
      // 当前在第几步
      activeStep: '1',
      // 定时器
      timer: null,
      repeat: 200
    }
  },
  computed: {
    // 后台开启了哪些支付方式
    powerObj({ $root }) {
      const {
        WXPAY_CONFIG_KEY: wechat,
        ALIPAY_CONFIG_KEY: alipay
      } = $root.powerObj

      return { wechat, alipay }
    }
  },
  created() {
    this.getAuthStatus()
  },
  mounted() {},
  destroyed() {
    this.clearTimer()
  },
  methods: {
    // 检查用户已实名认证到哪一步
    async getAuthStatus() {
      this.$root.loading = true
      const { data: res } = await authStatus()

      this.$root.loading = false

      if (res.code !== 1) return

      // step = 1 未支付， step = 2 已支付，未实名， step = 4 已支付，已实名

      // 已支付、已实名
      if (res.step === 4) {
        this.isVerified = true
        this.$nextTick(() => {
          this.$refs.VerifiedRef.verifiedDetail = res.data
        })
        return
      }

      // 显示第几步
      this.activeStep = res.step + ''

      // 如果为第一步
      if (res.step === 1) {
        this.$nextTick(() => {
          // 订单数据
          this.$refs.Step1Ref.orderData = {
            outTradeNo: res.data.orderId,
            totalAmount: res.data.buyPayable
          }

          // 支付方式
          const payPower = {
            ALIPAY: this.powerObj.alipay == 1,
            WECHAT: this.powerObj.wechat == 1
          }
          res.pay_list.forEach(e => {
            if (e.paramKey === 'ALIPAY_CONFIG_KEY') {
              payPower.ALIPAY = true
            }
            if (e.paramKey === 'WXPAY_CONFIG_KEY') {
              payPower.WECHAT = true
            }
          })

          this.$refs.Step1Ref.payPower = payPower
          // 如果开启了支付宝支付
          if (payPower.ALIPAY) {
            this.$refs.Step1Ref.activePayway = 'ALIPAY'
          }
          // 获取微信支付方二维码
          if (payPower.WECHAT) {
            this.$refs.Step1Ref.activePayway = 'WECHAT'
            this.$refs.Step1Ref.getWechatCode()
          }
        })
      }
    },

    // 定时检测、支付和实名是否实名成功
    checkResult() {
      this.repeat = 200 // 限制执行次数为200次,时长为10分钟
      this.setTimer()
    },

    // 查询
    async doRefresh() {
      if (this.repeat == 0) {
        // 支付超时
        this.clearTimer()
        return
      }
      this.repeat--

      // 发起请求检查是否支付完成，需要传递参数 cert_name/cert_no 为空
      const { data: res } = await authStatus({
        cert_name: '',
        cert_no: ''
      })
      if (res.code !== 1) {
        this.clearTimer()
        return
      }
      if (res.step === 2) {
        // 支付成功，清除检测支付定时器
        if (!res.data || !res.data.uid) {
          // 清除定时器
          this.clearTimer()
          // 跳转到第二步
          this.activeStep = '2'
        }
      }
      // 实名成功
      if (res.step === 3) {
        // 清除定时器
        this.clearTimer()
        // 跳转第三步
        this.activeStep = '3'
        // 获取实名信息
        const { data: res2 } = await authStatus({
          cert_name: '',
          cert_no: ''
        })
        this.$refs.Step3Ref.verifiedSuccess = res2.data || {}
        // 更新用户信息
        this.$root.getUserinfo()
      }
    },

    setTimer() {
      this.clearTimer()
      this.doRefresh()
      this.timer = setTimeout(this.setTimer, 3 * 1000)
    },

    // 清除定时器
    clearTimer() {
      clearTimeout(this.timer)
    }
  }
}
</script>

<style lang="scss">
.verification-box {
  .verify-steps_box {
    .aicon {
      font-weight: normal;
      font-size: 30px;
      margin-bottom: -6px;
      margin-right: 10px;
    }

    .el-steps--simple {
      background-color: theme('colors.ants-bg-2');
      border-radius: 10px;
    }

    @media screen and (max-width: 992px) {
      .el-steps--simple {
        padding: 10px;
      }

      .el-step.is-simple .el-step__title {
        font-size: 14px;
      }

      .aicon {
        font-size: 20px;
        margin-bottom: 0;
      }
    }
  }

  .el-tabs__header {
    display: none;
  }

  .el-tabs__content {
    padding: 20px 0 0;
  }

  .code_form_box {
    .el-form-item__content {
      width: 380px;
    }

    .el-button {
      margin: 0;
      float: right;
    }
  }
}
</style>
<style lang="scss">
.verification-box {
  .qr_code_box {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    // width: 800px;
    padding: 20px 30px 20px;
    border: 1px solid theme('colors.ants-border-4');
    border-radius: 10px;
    @media screen and (max-width: 767px) {
      padding: 20px;
    }

    .qr_icon_span {
      display: inline-block;
      margin-top: 7px;
      width: 120px;
      font-size: 60px;
      color: theme('colors.ants-text-4');

      @media screen and (max-width: 600px) {
        display: none;
      }
    }

    .qr_img_box {
      height: 250px;
      width: 208px;
      text-align: center;
      margin-top: 30px;

      .vue_qr_box {
        height: 180px;
        width: 180px;
        margin: 0 auto;
      }
    }
  }
}
</style>
