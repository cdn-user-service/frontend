<template>
  <div>
    <LoginTab name="注册" :power-obj="powerObj" :login-type.sync="loginType" />

    <div
      class="mb-xl py-sm text-2xl font-semibold text-center text-black"
      :class="{
        'mt-xxl': powerObj.wechat && (powerObj.mobile || powerObj.mail || powerObj.common)
      }"
    >
      {{ antsT('欢迎注册') }} {{ $root.webName }} {{ antsT('账号') }}
    </div>

    <!-- <component
      :is="activeComponentName"
      v-if="powerObj.wechat || powerObj.mobile || powerObj.mail"
      :power-obj="powerObj"
    ></component> -->

    <!-- 邮箱、手机号、微信扫码注册 start -->
    <!-- <div v-if="powerObj.wechat || powerObj.mobile || powerObj.mail"> -->
      <!-- 微信扫码登录 -->
      <WxLoginCode
        v-if="loginType === 'WxLoginCode'"
        @successListenCode="successListenCode"
        name="注册"
        style="margin-top:-25px;"
      />

      <!-- 邮箱手机号登录 -->
      <MailMobileForm :power-obj="powerObj" v-else />
    <!-- </div> -->

    <!-- 普通账号注册 start,TODO:似乎用不上 -->
    <!-- <BaseRegForm v-else /> -->

    <div class="text-center items-center text-sm mt-xxl">
      {{ antsT('已有') }} {{ $root.webName }}{{ antsT('账号') }}？<router-link
        to="/login"
        >{{ antsT('前往登录') }} >></router-link
      >
    </div>
  </div>
</template>

<script>
// 组件
import LoginTab from '../components/LoginTab'
import MailMobileForm from './components/MailMobileForm'
// import BaseRegForm from './components/BaseRegForm'
import WxLoginCode from '@/v2/cdn_users/components/WxLoginCode'

// 验证规则
import { isTel, isEmail } from '@/utils/validate'
import { setToken } from '@/utils/auth'

export default {
  components: {
    LoginTab,
    MailMobileForm,
    // BaseRegForm,
    WxLoginCode
  },
  computed: {
    // 后台开启了哪些登录方式 
    powerObj({ $root }) {
      const {
        WXLOGIN_CONFIG_KEY: wechat,
        SMS_CONFIG_KEY: mobile,
        MAIL_CONFIG_KEY: mail,
        REGISTER_COMMON: common
      } = $root.powerObj

      return { wechat, mobile, mail, common }
    },
    // 后台是否禁用注册功能，true = 禁用
    isForbidRegister({ $root }) {
      const { register } = $root.webConfig.power

      return register === 1
    }
  },
  data() {
    return {
      // 登录方式切换
      loginType: 'MailMobileForm',
      // 同意协议勾选
      agreementChecked: false
    }
  },
  watch: {},
  created() {
    // this.$root.getWebConfigData()
  },
  mounted() {
    if (this.isForbidRegister) {
      this.$router.replace('/login')
    }
  },
  methods: {
    /**
     * @description: 监听微信扫码
     */

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
