<template>
  <div>
    <LoginTab :power-obj="powerObj" :login-type.sync="loginType" />

    <div
      class="mb-xl py-sm text-2xl font-semibold text-center text-black"
      :class="{
        'mt-xxl': powerObj.wechat && (powerObj.mobile || powerObj.mail)
      }"
    >
      {{ antsT('欢迎登录') }} {{ $root.webName }} {{ antsT('系统') }}
    </div>

    <!-- <component
      :is="activeComponentName"
      v-if="powerObj.wechat || powerObj.mobile || powerObj.mail"
      :power-obj="powerObj"
    ></component> -->

    <!-- 微信扫码登录、手机号|邮箱登录 -->
    <!-- <div v-if="powerObj.wechat || powerObj.mobile || powerObj.mail"> -->
      <!-- 微信扫码登录 -->
      <WxLoginCode
        v-if="loginType === 'WxLoginCode'"
        @successListenCode="successListenCode"
        name="登录"
        style="margin-top:-25px;"
      />

      <!-- 邮箱手机号登录 -->
      <MailMobileForm :power-obj="powerObj" v-else />
    <!-- </div> -->

    <!-- 普通张海登录：TODO：似乎用不上 -->
    <!-- <BaseLoginForm v-else /> -->

    <div class="flex justify-between items-center mt-xl">
      <router-link to="/reset-password">{{ antsT('忘记密码？') }}</router-link>
      <router-link to="/register" v-if="!isForbidRegister">{{ antsT('立即注册') }} >></router-link>
    </div>
  </div>
</template>

<script>
// 组件
import LoginTab from '../components/LoginTab'
import MailMobileForm from './components/MailMobileForm'
// import BaseLoginForm from './components/BaseLoginForm'
import WxLoginCode from '@/v2/dns_users/components/WxLoginCode'
import { setToken } from '@/utils/auth'

export default {
  components: {
    LoginTab,
    MailMobileForm,
    // BaseLoginForm,
    WxLoginCode
  },
  data() {
    return {
      // 登录方式切换
      loginType: this.$root.powerObj.WXLOGIN_CONFIG_KEY
        ? 'WxLoginCode'
        : 'MailMobileForm'
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
  watch: {
    'powerObj.wechat': function(newVal, oldVal) {
      if (newVal == 1) {
        this.loginType = 'WxLoginCode'
      }
    }
  },
  created() {
  },
  methods: {
    /**
     * @description: 微信扫码成功后的逻辑
     */

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
