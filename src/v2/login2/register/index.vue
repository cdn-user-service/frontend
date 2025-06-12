<template>
  <div class="bg-white rounded-2xl py-xxl relative">
    <ToggleType
      @change="toggleType"
      v-if="powerObj.wechat"
      name="注册"
    />

    <div
      class="pb-xl text-4xl text-center"
      :class="{ 'pt-lg -mb-sm': powerObj.wechat }"
    >
      {{ antsT(loginType === 'WxLoginCode' ? '微信扫码注册' : '账号密码注册') }}
    </div>

    <!-- 微信扫码注册 -->
    <WxLoginCode
      class="px-lg"
      v-if="loginType === 'WxLoginCode'"
      @successListenCode="successListenCode"
      name="注册"
    />

    <!-- 账号注册 -->
    <el-form
      v-else
      label-width="0px"
      class="space-y-8 px-24"
      :model="form"
      :rules="rules"
      ref="formRef"
      method="post"
    >
      <ants-form-item prop="username">
        <ants-input
          placeholder="请输入邮箱/手机号"
          prefix-icon="aicon icon-yonghu-"
          v-model="form.username"
          maxlength="32"
        />
      </ants-form-item>
      <ants-form-item prop="checkCode">
        <div class="flex items-center captcha-box border border-ants-border-1">
          <ants-input
            placeholder="验证码"
            prefix-icon="aicon icon-yanzhengma2"
            v-model="form.checkCode"
            maxlength="32"
          />

          <el-link
            @click="showCaptchaDialog"
            type="primary"
            :underline="false"
            :disabled="btnIsDisabled || isRegistedLoading"
            style="padding: 0 10px;font-size:12px;white-space: nowrap;"
          >{{ antsT(btnText)}}
          </el-link>
        </div>
      </ants-form-item>
      <ants-form-item prop="newpassword">
        <ants-input
          placeholder="请输入密码"
          prefix-icon="aicon icon-mima1"
          v-model.trim="form.newpassword"
          show-password
          maxlength="32"
        />
      </ants-form-item>
      <ants-form-item prop="password">
        <ants-input
          placeholder="请输入密码"
          prefix-icon="aicon icon-mima1"
          v-model="form.password"
          show-password
          maxlength="32"
        />
      </ants-form-item>

      <div class="text-sm">
        <el-checkbox v-model="agreementChecked">
          <span class="text-sm">
            {{ antsT('我已阅读并同意') }}
          </span>
        </el-checkbox>
        <span
          class="cursor-color text-primary text-sm"
          @click="showAgreementDialog"
        >《{{ $root.webName }} {{ antsT('服务协议') }}》</span>
      </div>
      <ants-form-item class="pb-df">
        <ants-button
          type="primary"
          @click="submitForm"
          @keydown.enter="submitForm"
          :loading="btnLoading"
          class="w-full"
          text="立即注册"
        />
      </ants-form-item>
    </el-form>

    <div class="text-center pt-df">
      {{ antsT('已有账号？')}}
      <router-link
        class="text-primary"
        to="/login"
      >
        {{ antsT('前往登录')}}>>
      </router-link>
    </div>

    <CaptchaDialog
      ref="CaptchaDialogRef"
      :btn-text.sync="btnText"
      :btn-is-disabled.sync="btnIsDisabled"
    />

    <AgreementDialog ref="AgreementDialogRef" />
  </div>
</template>

<script>
// 组件
import ToggleType from '../login/ToggleType.vue'
import dnsWxLoginCode from '@/v2/dns_users/components/WxLoginCode'
import cdnWxLoginCode from '@/v2/cdn_users/components/WxLoginCode'

import dnsCaptchaDialog from '@/v2/dns_users/components/CaptchaDialog'
import cdnCaptchaDialog from '@/v2/cdn_users/components/CaptchaDialog'

import dnsAgreementDialog from '@/v2/dns_users/components/AgreementDialog'
import cdnAgreementDialog from '@/v2/cdn_users/components/AgreementDialog'
// 验证规则
import { isTel, isEmail } from '@/utils/validate'
import { setToken } from '@/utils/auth'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { register } = require(`@/v2/${PROCESS_NAME}/api/login`)

export default {
  components: {
    ToggleType,
    // 动态引入组件 cdn_users 目录，和 dns_users 目录下的
    // WxLoginCode: (resolve) => require([`@/v2/${PROCESS_NAME}/components/WxLoginCode`], resolve),
    WxLoginCode: PROCESS_NAME === 'dns_users' ? dnsWxLoginCode : cdnWxLoginCode,
    CaptchaDialog:
      PROCESS_NAME === 'dns_users' ? dnsCaptchaDialog : cdnCaptchaDialog,
    AgreementDialog:
      PROCESS_NAME === 'dns_users' ? dnsAgreementDialog : cdnAgreementDialog
  },
  data() {
    // 验证规则
    const { isPassword } = this.$validator

    // 二次验证密码
    const checkPassWord2 = (rule, value, callback) => {
      if (value === this.form.newpassword) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    // 验证邮箱和手机号的验证规则
    const checkRegMail = (rule, value, callback) => {
      const regValue = value.trim()

      // 如果为手机号注册
      if (isTel(regValue)) {
        this.regType = 'mobile'
        return callback()
      }

      // 如果为邮箱注册
      if (isEmail(regValue)) {
        this.regType = 'mail'
        return callback()
      }

      return callback(new Error('请输入合法的邮箱或手机号'))
    }

    // 验证手机号或邮箱是否已注册过
    const checkIsRegisted = (rule, value, callback) => {
      if (this.isRegisted) return callback(new Error('该账号已注册'))
      callback()
    }

    return {
      // 微信登录 = WxLoginCode， 账号登录 = MailMobileForm
      loginType: 'MailMobileForm',
      btnLoading: false,
      // 同意协议
      agreementChecked: false,
      // 判断是邮箱注册还是手机号注册
      regType: '',
      // 获取短信验证码按钮是否禁用
      btnIsDisabled: false,
      // 获取短信验证码按钮文字
      btnText: '获取验证码',

      // 是否已注册
      isRegisted: false,
      isRegistedLoading: false,

      form: {
        username: '',
        newpassword: '',
        password: '',
        checkCode: ''
      },
      rules: {
        username: [
          {
            required: true,
            message: '请输入注册账号',
            trigger: ['change', 'blur']
          },
          {
            validator: checkRegMail,
            trigger: 'blur'
          },
          {
            validator: checkIsRegisted,
            trigger: 'blur'
          }
        ],
        checkCode: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur']
          }
        ],
        newpassword: [
          {
            required: true,
            message: '请输入密码',
            trigger: ['change', 'blur']
          },
          {
            validator: isPassword(),
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入确认密码',
            trigger: ['change', 'blur']
          },
          {
            validator: checkPassWord2,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    // 后台开启了哪些登录方式
    powerObj({ $root }) {
      const {
        WXLOGIN_CONFIG_KEY: wechat,
        SMS_CONFIG_KEY: mobile,
        MAIL_CONFIG_KEY: mail
      } = $root.powerObj

      return { wechat, mobile, mail }
    },
    // 后台是否禁用注册功能，true = 禁用
    isForbidRegister({ $root }) {
      const { register } = $root.webConfig.power

      return register === 1
    }
  },
  created() {},
  mounted() {
    if (this.isForbidRegister) {
      this.$router.replace('/login')
    }
  },
  methods: {
    // 切换注册方式
    toggleType(type = '') {
      this.loginType = type
    },

    // 点击获取验证码，显示数字验证码对话框
    async showCaptchaDialog() {
      // 单独验证是否输入了手机号或者邮箱
      this.$refs.formRef.validateField('username', async (valid) => {
        // 恢复
        this.isRegisted = false
        // 如果没有输入则返回
        if (valid) return

        // 显示验证数字验证码对话框
        this.$refs.CaptchaDialogRef.showDialog(this.regType, this.form.username)
      })
    },

    // 注册提交
    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        if (!this.agreementChecked) {
          return this.$msg.error(
            `${this.antsT('请您阅读并同意')}《${
              this.$root.webName
            } ${this.antsT('服务协议')}》`
          )
        }
        this.btnLoading = true
        try {
          const { data: res } = await register({
            code: this.form.checkCode,
            [this.regType]: this.form.username,
            password: this.form.password,
            uuid: new Date().getTime() // 随机数
          })

          if (res.code !== 1) {
            this.btnLoading = false
            return
          }

          setTimeout(() => {
            this.btnLoading = false
          }, 3000)

          setToken(res.token, this.form.username)
          this.$msg.success(this.antsT('恭喜您已注册成功'))
          this.$router.push('/console')
        } catch (error) {
          this.btnLoading = false
          throw error
        }
      })
    },

    // 查看同意协议
    showAgreementDialog() {
      this.$refs.AgreementDialogRef.showDialog()
    },

    // 微信扫码成功后的回调
    async successListenCode(res = {}) {
      // 1、如果为注册
      if (res.step === 1) {
        // TODO A、若只开启了微信注册登录，没有开启手机号或邮箱，直接跳转到控制台

        // B、若开启了手机号或邮箱，则去选择绑定账号，还是新注册
        const obj = res.data || {}
        window.sessionStorage.setItem(
          'wxPostData',
          JSON.stringify({
            nickname: obj.username,
            openid: obj.wechatOpenid
          })
        )
        this.$router.replace('/register-binding')
        return
      }

      // 2、若为登录
      this.$msg.info(this.antsT('您已注册过'))
      setToken(res.data)
      window.sessionStorage.setItem('lt', new Date().getTime())

      // 如果重定向路径为登录页
      let redirect = this.$route.query.redirect
      if (redirect == '/login' || !redirect) redirect = '/console'
      this.$router.replace(redirect)

      setTimeout(() => {
        this.$notify({
          title: '登录成功',
          message: '欢迎回来！',
          type: 'success',
          offset: 60
        })
      }, 500)
    }
  }
}
</script>
