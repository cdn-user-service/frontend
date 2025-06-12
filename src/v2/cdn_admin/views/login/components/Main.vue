<template>
  <el-main class="flex justify-center items-center">
    <div
      class="ants-login-form overflow-hidden relative px-lg py-xxl sm:p-xxxl bg-white rounded-2xl animated fadeInUp"
      style="width: 450px"
    >
      <!-- <div
        class="login-tab absolute inset-x-0 top-0 flex text-center text-black animated fadeIn"
      >
        <div
          v-for="(item, key) in {
            base: '账号密码登录',
            google: 'Google Authenticator'
          }"
          :key="key"
          class="text-2xl font-semibold flex-1 py-lg cursor-color"
          :class="{ 'bg-white text-primary': key === loginType }"
          @click="changeTab(key)"
        >
          {{ antsT(item) }}
        </div>
      </div> -->
      <div
        class="mb-xxl text-black text-3xl font-semibold text-center truncate"
      >
        {{ $root.webName }} {{ antsT('业务管理系统') }}
      </div>

      <div>
        <!-- <GoogleLogin v-show="loginType === 'google'" /> -->

        <el-form
          v-show="loginType === 'base'"
          label-width="150px"
          label-position="top"
          :model="form"
          :rules="rules"
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
              @blur="doGoogleCheck"
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
    </div>
  </el-main>
</template>

<script>
import { login, googleCheck } from '@/v2/cdn_admin/api/login'
import { setToken } from '@/utils/auth'
// import GoogleLogin from './GoogleLogin'

export default {
  components: {
    // GoogleLogin
  },
  data() {
    const rules = {
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
      ],
      googleAuthCode: [
        {
          required: true,
          message: '请输入Google Authenticator 验证码',
          trigger: ['change', 'blur']
        }
      ]
    }

    return {
      btnLoading: false,
      loginType: 'base',
      form: {
        username: '',
        password: '',
        captcha: '',
        googleAuthCode: ''
      },
      rules,
      isShowGoogleAuth: false
    }
  },
  mounted() {
    // 账户输入框自动获取焦点
    this.$nextTick(() => {
      this.$refs.usernameInputRef.$children[0].focus()
    })
  },
  methods: {
    changeTab(tab) {
      this.loginType = tab
    },

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
    },

    // 检查是否需要google auth
    async doGoogleCheck() {
      const { data: res } = await googleCheck({ userName: this.form.username })
      if (res.code !== 1) return
      this.isShowGoogleAuth = res.google_auth_status === 1
    }
  }
}
</script>

<style lang="scss" scoped>
.login-tab {
  border-bottom: 1px solid #f5f5f5;
  background-color: #f2f6fa;
}
</style>
