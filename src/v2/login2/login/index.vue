<template>
  <div class="bg-white rounded-2xl py-xxl relative">
    <ToggleType @change="toggleType" v-if="powerObj.wechat" />

    <div
      class="pb-xxl text-5xl text-center"
      :class="{ 'pt-lg -mb-df': powerObj.wechat }"
    >
      <strong class="text-primary mr-sm">
        Cloud
      </strong>
      <span>platform</span>
    </div>

    <!-- 微信扫码登录 -->
    <WxLoginCode
      class="px-lg"
      v-if="loginType === 'WxLoginCode'"
      @successListenCode="successListenCode"
      name="登录"
    />

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
          placeholder="请输入登录账号"
          prefix-icon="aicon icon-yonghu-"
          v-model="form.username"
          maxlength="32"
          @keydown.enter.native="submitForm()"
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
        <div class="flex items-center captcha-box border border-ants-border-1">
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

      <!-- <div class="border-t border-ants-border-3"></div>

                <ants-form-item prop="security">
                  <ants-input
                    placeholder="安全码"
                    prefix-icon="el-icon-key"
                    v-model="form.security"
                    show-password
                    maxlength="32"
                    @keydown.enter.native="submitForm()"
                  />
                </ants-form-item> -->

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

    <div class="flex justify-between px-24 pt-sm">
      <router-link class="text-primary" to="/forget">
        {{ antsT('忘记密码？') }}
      </router-link>

      <router-link v-if="!isForbidRegister" class="text-primary" to="/register">
        {{ antsT('立即注册') }}
      </router-link>
    </div>
  </div>
</template>

<script>
import ToggleType from './ToggleType.vue'
import dnsWxLoginCode from '@/v2/dns_users/components/WxLoginCode'
import cdnWxLoginCode from '@/v2/cdn_users/components/WxLoginCode'
import { setToken } from '@/utils/auth'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { login } = require(`@/v2/${PROCESS_NAME}/api/login`)

export default {
  components: {
    ToggleType,
    WxLoginCode: PROCESS_NAME === 'dns' ? dnsWxLoginCode : cdnWxLoginCode
  },
  data() {
    return {
      // 微信登录 = WxLoginCode， 账号登录 = MailMobileForm
      loginType: 'MailMobileForm',
      btnLoading: false,
      form: {
        username: '',
        password: '',
        captcha: '',
        security: ''
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
        ],
        security: [
          {
            required: true,
            message: '请输入安全码',
            trigger: ['change', 'blur']
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
  mounted() {},
  methods: {
    // 切换登录方式
    toggleType(type = '') {
      this.loginType = type
    },

    // 登录提交
    submitForm() {
      if (this.btnLoading) return
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
          const { data: res } = await login({
            account: this.form.username,
            // password: this.$md5(this.form.password),
            password: this.form.password,
            code: this.form.captcha,
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
          let redirect = this.$route.query.redirect
          if (redirect == '/login' || !redirect) redirect = '/console'
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

    // 微信扫码成功后的回调
    async successListenCode(res = {}) {
      // 1、如果为注册
      if (res.step === 1) {
        // 若开启了手机号或邮箱，则去选择绑定账号，还是新注册
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

      // 2、直接登录
      setToken(res.data)
      window.sessionStorage.setItem('lt', new Date().getTime())

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
          title: this.antsT('登录成功'),
          message: this.antsT('欢迎回来！'),
          type: 'success',
          offset: 60
        })
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped></style>
