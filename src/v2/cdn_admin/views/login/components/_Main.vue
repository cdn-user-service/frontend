<template>
  <el-main class="flex justify-center items-center">
    <div
      class="ants-login-form px-lg py-xxl sm:p-xxxl bg-white rounded-2xl animated fadeInUp"
      style="width: 450px"
    >
      <div
        class="mb-xxl text-black text-3xl font-semibold text-center truncate"
      >
        {{ $root.webName }} {{ antsT('业务管理系统') }}
      </div>
      <el-form
        label-width="150px"
        label-position="top"
        :model="form"
        :rules="formRules"
        ref="formRef"
        hide-required-asterisk
        class="space-y-12"
      >
        <ants-form-item prop="username">
          <ants-input
            is-bgc
            placeholder="登录账号"
            prefix-icon="aicon icon-dianhua"
            v-model="form.username"
            @keydown.enter.native="submitForm()"
            maxlength="32"
            ref="usernameInputRef"
          />
        </ants-form-item>
        <ants-form-item prop="password">
          <ants-input
            is-bgc
            placeholder="登录密码"
            prefix-icon="aicon icon-mima1"
            v-model="form.password"
            @keydown.enter.native="submitForm()"
            show-password
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
        <ants-form-item style="margin-bottom: 10px">
          <ants-button
            type="primary"
            @click="submitForm"
            @keydown.enter="submitForm"
            :loading="btnLoading"
            class="text-2xl w-full"
            style="padding: 15px 20px"
            text="登 录"
          />
        </ants-form-item>
      </el-form>
    </div>
  </el-main>
</template>

<script>
import { login } from '@/v2/cdn_admin/api/login'
import { setToken } from '@/utils/auth'

export default {
  data() {
    return {
      btnLoading: false,
      form: {
        username: '',
        password: '',
        captcha: ''
      },
      formRules: {
        username: [
          {
            required: true,
            message: '请输入登录账号',
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
            message: '请输入右边验证码',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  mounted() {
    // 账户输入框自动获取焦点
    this.$nextTick(() => {
      this.$refs.usernameInputRef.$children[0].focus()
    })
  },
  methods: {
    /**
     * @description: 登录提交
     */

    submitForm() {
      // 避免 keydown 时重复提交
      if (this.btnLoading) return
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true
        const { data: res } = await login({
          ...this.form,
          // 随机数
          uuid: this.$refs.AntsCaptchaRef.random
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
