<template>
  <el-row :gutter="50">
    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 12 }"
      :md="{ span: 12 }"
      :lg="{ span: 12 }"
      :xl="{ span: 12 }"
      style="padding-right: 50px"
      v-if="powerObj.wechat"
      class="hidden-xs-only"
    >
      <div class="login-title text-center">微信扫码登录</div>
      <div class="border-r border-ants-border-2" style="min-height: 300px">
        <WxLoginCode @successListenCode="successListenCode" hideDivider />
      </div>
    </el-col>

    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: colSpan }"
      :md="{ span: colSpan }"
      :lg="{ span: colSpan }"
      :xl="{ span: colSpan }"
      style="min-height: 375px"
    >
      <div class="login-title text-center">
        <span
          class="cursor-color whitespace-no-wrap"
          :class="{ 'text-primary': loginType === 'MailMobileForm' }"
          @click="loginType = 'MailMobileForm'"
        >
          {{ antsT('账号密码登录') }}
        </span>

        <!-- <el-divider direction="vertical" />

        <span
          class="cursor-color whitespace-no-wrap"
          :class="{ 'text-primary': loginType === 'GoogleLogin' }"
          @click="loginType = 'GoogleLogin'"
        >
          Google Authenticator
        </span> -->
      </div>

      <component :is="loginType" :power-obj="powerObj" />

      <div class="flex justify-between items-center mt-df">
        <router-link to="/reset-password">{{
          antsT('忘记密码？')
        }}</router-link>
        <router-link to="/register" v-if="!isForbidRegister"
          >{{ antsT('立即注册') }} >></router-link
        >
      </div>
    </el-col>
  </el-row>
</template>

<script>
// 组件
import MailMobileForm from './components/MailMobileForm'
import WxLoginCode from '@/v2/cdn_users/components/WxLoginCode'
import GoogleLogin from './components/GoogleLogin'
import { setToken } from '@/utils/auth'

export default {
  components: {
    MailMobileForm,
    WxLoginCode,
    GoogleLogin
  },
  data() {
    return {
      // 登录方式切换
      loginType: 'MailMobileForm'
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
    },
    colSpan() {
      return this.powerObj.wechat ? 12 : 24
    }
  },
  created() {},
  methods: {
    // 微信扫码成功后的逻辑
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
      let redirect = this.$route.query.redirect
      if (redirect == '/login' || !redirect) redirect = '/console'
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

<style lang="scss" scoped>
.login-title {
  padding-bottom: 30px;
  font-size: 18px;
  font-weight: 500;
  @media screen and (max-width: 768px) {
    font-size: 16px;
  }
}
</style>
