<template>
  <Banner>
    <div class="bg-white rounded-2xl py-xxl relative">
      <div class="mb-xxl text-5xl text-center">
        <strong class="text-primary mr-sm">
          Cloud
        </strong>
        <span>platform</span>
      </div>

      <el-form
        label-width="0px"
        class="space-y-8 px-24"
        :model="form"
        :rules="rules"
        ref="formRef"
        method="post"
      >
        <ants-form-item prop="username">
          <ants-input
            placeholder="请输入登录账号"
            prefix-icon="aicon icon-yonghu-"
            v-model="form.username"
            maxlength="32"
            @keydown.enter.native="submitForm()"
            ref="usernameInputRef"
          />
        </ants-form-item>
        <ants-form-item prop="password">
          <ants-input
            placeholder="请输入密码"
            prefix-icon="aicon icon-mima1"
            v-model="form.password"
            show-password
            maxlength="32"
            @keydown.enter.native="submitForm()"
          />
        </ants-form-item>
        <ants-form-item prop="captcha">
          <div
            class="flex items-center captcha-box border border-ants-border-1"
          >
            <ants-input
              placeholder="验证码"
              prefix-icon="aicon icon-zhucedengluyanzhengma"
              v-model="form.captcha"
              @keydown.enter.native="submitForm()"
              maxlength="32"
            />
            <AntsCaptcha
              ref="AntsCaptchaRef"
              style="height:40px;min-width:80px;margin:0;border-radius:0 4px 4px 0;"
            />
          </div>
        </ants-form-item>

        <ants-form-item class="pb-df">
          <ants-button
            type="primary"
            @click="submitForm"
            @keydown.enter="submitForm"
            :loading="btnLoading"
            class="w-full mt-sm"
            text="登 录"
          />
        </ants-form-item>
      </el-form>
    </div>
  </Banner>
</template>

<script>
import Banner from '../Banner'
import { setToken } from '@/utils/auth'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { login } = require(`@/v2/${PROCESS_NAME}/api/login`)

export default {
  components: {
    Banner
  },
  data() {
    return {
      btnLoading: false,
      form: {
        username: '',
        password: '',
        captcha: ''
      },
      rules: {
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
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {},
  mounted() {
    // 账户输入框自动获取焦点
    this.$nextTick(() => {
      this.$refs.usernameInputRef.$children[0].focus()
    })
  },
  methods: {
    // 登录提交
    submitForm() {
      // 避免 keydown 时重复提交
      if (this.btnLoading) return
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
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
            Object.keys(query).forEach(key => {
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
        } catch (error) {
          this.btnLoading = false
          this.$msg.error('接口异常，请稍后再试！')
          throw error
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
