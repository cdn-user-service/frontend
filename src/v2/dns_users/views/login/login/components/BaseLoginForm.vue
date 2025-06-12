<template>
  <el-form
    label-width="0px"
    class="space-y-10"
    :model="form"
    :rules="loginFormRules"
    ref="ruleForm"
    method="post"
  >
    <ants-form-item prop="mobile">
      <ants-input
        is-bgc
        placeholder="请输入登录邮箱"
        prefix-icon="aicon icon-youxiang1"
        v-model="form.mobile"
        maxlength="32"
        @keydown.enter.native="submitForm()"
      />
    </ants-form-item>
    <ants-form-item prop="password">
      <ants-input
        is-bgc
        placeholder="请输入密码"
        prefix-icon="aicon icon-mima1"
        v-model="form.password"
        show-password
        maxlength="32"
        @keydown.enter.native="submitForm()"
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
        @keydown.enter="submitForm"
        :loading="btnLoading"
        class="text-2xl w-full"
        text="登 录"
      />
    </ants-form-item>
  </el-form>
</template>

<script>
import { setToken } from '@/utils/auth'

export default {
  data() {
    return {
      btnLoading: false,
      form: {
        mobile: '',
        password: '',
        captcha: ''
      },
      loginFormRules: {
        mobile: [
          {
            required: true,
            message: '请输入登录邮箱',
            trigger: ['change', 'blur']
          }
        ],
        password: [
          {
            required: true,
            message: '请输入登录密码',
            trigger: ['change', 'blur']
          }
        ],
        captcha: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 普通账号登录
     */

    submitForm() {
      if (this.btnLoading) return
      // 表单与验证
      this.$refs.ruleForm.validate(async valid => {
        if (!valid) return

        this.form.uuid = this.$refs.AntsCaptchaRef.random
        const { data: res } = await this.$http.post('', this.form)
        if (res.code !== 1) {
          return
        }

        const username = res.username || this.loginForm.mobile

        setToken(res.token, username)

        // 如果重定向路径为登录页
        let redirect = this.$route.query.redirect
        if (redirect == '/login' || !redirect) redirect = '/console'
        this.$router.replace(redirect)

        setTimeout(() => {
          this.$notify({
            title: '登录成功',
            message: '欢迎回来！' + username,
            type: 'success',
            offset: 60
          })
        }, 500)
      })
    }
  }
}
</script>
