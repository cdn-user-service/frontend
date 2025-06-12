<template>
  <el-form
    label-width="0px"
    :model="form"
    :rules="formRules"
    ref="formRef"
    class="space-y-10"
  >
    <ants-form-item prop="username">
      <ants-input
        is-bgc
        :placeholder="'请输入' + showTitle"
        prefix-icon="aicon icon-yonghu-"
        v-model="form.username"
        maxlength="32"
        @keydown.enter.native="submitForm()"
        @blur="doGoogleCheck"
      />
    </ants-form-item>

    <ants-form-item prop="passwd">
      <ants-input
        is-bgc
        placeholder="请输入密码"
        prefix-icon="aicon icon-mima1"
        v-model="form.passwd"
        show-password
        maxlength="32"
        @keydown.enter.native="submitForm()"
      />
    </ants-form-item>

    <ants-form-item prop="googleAuthCode" v-if="isShowGoogleAuth">
      <ants-input
        is-bgc
        placeholder="Google Authenticator 验证码"
        prefix-icon="aicon icon-zhucedengluyanzhengma"
        v-model="form.googleAuthCode"
        @keydown.enter.native="submitForm()"
        maxlength="32"
      />
    </ants-form-item>

    <ants-form-item prop="captcha" class="ants-captcha_item">
      <ants-input
        is-bgc
        placeholder="验证码"
        prefix-icon="aicon icon-zhucedengluyanzhengma"
        v-model="form.captcha"
        @keydown.enter.native="submitForm()"
        maxlength="32"
      />
      <AntsCaptcha ref="AntsCaptchaRef" />
    </ants-form-item>
    <ants-form-item>
      <ants-button
        type="primary"
        @click="submitForm"
        class="text-2xl w-full"
        :loading="btnLoading"
        text="登 录"
      />
    </ants-form-item>
  </el-form>
</template>

<script>
import { login, googleCheck } from '@/v2/cdn_users/api/login'
import { setToken } from '@/utils/auth'

export default {
  name: 'LoginMailMobile',
  data() {
    return {
      btnLoading: false,
      form: {
        username: '',
        captcha: '',
        passwd: '',
        googleAuthCode: ''
      },
      formRules: {
        username: [
          {
            required: true,
            message: '请输入登录账号',
            trigger: ['change', 'blur']
          }
        ],
        captcha: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur']
          }
        ],
        passwd: [
          {
            required: true,
            message: '请输入密码',
            trigger: ['change', 'blur']
          }
        ],
        googleAuthCode: [
          {
            required: true,
            message: '请输入Google Authenticator 验证码',
            trigger: ['change', 'blur']
          }
        ]
      },
      isShowGoogleAuth: false
    }
  },
  props: {
    powerObj: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    showTitle() {
      let text = '邮箱'
      if (this.powerObj.mail) {
        text = '邮箱'
      }
      if (this.powerObj.mobile) {
        text = '手机号'
      }
      if (this.powerObj.mobile && this.powerObj.mail) {
        text = '邮箱/手机号'
      }
      return text
    }
  },
  created() {},
  methods: {
    /**
     * @description: 登录提交
     */

    submitForm() {
      if (this.btnLoading) return
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true

        try {
          const { data: res } = await login({
            account: this.form.username,
            // password: this.$md5(this.form.passwd),
            password: this.form.passwd,
            code: this.form.captcha,
            googleAuthCode: this.form.googleAuthCode,
            uuid: this.$refs.AntsCaptchaRef.random // 随机数
          })

          if (res.code !== 1) {
            this.btnLoading = false
            this.$refs.AntsCaptchaRef.changeCaptcha()
            this.form.captcha = ''
            return
          }

          setTimeout(() => {
            this.btnLoading = false
          }, 3000)

          // 保存登录凭证并跳转到后台
          const username = res.username || this.form.username
          setToken(res.token, username)

          // 如果重定向路径为登录页
          const { query } = this.$route
          let redirect = query.redirect
          if (redirect) {
            // 其他携带的路由参数
            Object.keys(query).forEach((key) => {
              if (key == 'redirect') return
              redirect += `&${key}=${query[key]}`
            })
          }
          if (!redirect || redirect == '/login') {
            redirect = '/console'
          }
          this.$router.replace(redirect)

          setTimeout(() => {
            this.$notify({
              title: this.antsT('登录成功'),
              message: this.antsT('欢迎回来！') + username,
              type: 'success',
              offset: 60
            })
          }, 500)
        } catch (error) {
          this.btnLoading = false
          throw error
        }
      })
    },

    // 检查是否需要google auth
    async doGoogleCheck() {
      if (!this.form.username) return
      const { data: res } = await googleCheck({ user: this.form.username })
      if (res.code !== 1) return
      this.isShowGoogleAuth = res.data && res.google_auth_status === 1
    }
  }
}
</script>
