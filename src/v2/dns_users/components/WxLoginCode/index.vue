<template>
  <div v-loading="loading" class="wx-login-code">
    <div v-if="!loading" style="height: 230px">
      <wxlogin
        :appid="wxloginObj.appid"
        scope="snsapi_login"
        theme="white"
        :state="wxloginObj.state"
        :redirect_uri="encodeURIComponent(wxloginObj.redirect_uri)"
        href="data:text/css;base64,LmltcG93ZXJCb3ggLnRpdGxlIHsNCiAgZGlzcGxheTogbm9uZTsNCn0NCi5pbXBvd2VyQm94IC5zdGF0dXMuc3RhdHVzX2Jyb3dzZXIgew0KICBkaXNwbGF5OiBub25lOw0KfQ0KLmltcG93ZXJCb3ggLnFyY29kZSB7DQogIGJvcmRlcjogbm9uZTsNCiAgd2lkdGg6IDIwMHB4Ow0KICBoZWlnaHQ6IDIwMHB4Ow0KfQ0KLmltcG93ZXJCb3ggLnN0YXR1c3sNCiAgZGlzcGxheTogbm9uZQ0KfQ=="
      >
      </wxlogin>
    </div>
    <div v-else style="height: 235px"></div>
    <el-divider content-position="center"
      >{{ antsT('使用微信扫码快速') }}{{ antsT(name) }}</el-divider
    >
  </div>
</template>

<script>
// API，用户登录注册
import { wxcode, listenWxcode } from '@/v2/dns_users/api/login'
// 绑定微信
import { bindWechatCode } from '@/v2/dns_users/api/dns/account'

import { getLocation } from '@/utils/env'

import wxlogin from 'vue-wxlogin'

export default {
  name: 'WxLoginCode',
  components: {
    wxlogin
  },
  props: {
    // 扫码的名称
    name: String,
    // 跳转接收 code、state 参数的 router路径， 以 / 开头，如果不传则默认为当前 router
    routerUrl: {
      type: String,
      default: ''
    },
    // 是否为绑定微信扫码
    isBind: Boolean
  },
  data() {
    return {
      loading: false,
      // 二维码数据
      wxloginObj: {
        appid: '',
        scope: 'snsapi_login',
        redirect_uri: '',
        state: ''
      },

      // 监听扫码的数据
      code: '',
      state: ''
    }
  },
  computed: {
    // 后台是否开启了微信登录注册功能
    isWxlogin({ $root }) {
      return $root.powerObj.WXLOGIN_CONFIG_KEY === 1
    }
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.query': function (newVal, oldVal) {
      // 如果跳转到不是本页，则需要到指定的页面进行监听
      if (this.routerUrl !== '') return

      const { code, state } = newVal
      if (code && state) {
        this.code = code
        this.state = state
        this.listenCode()
      }
    }
  },
  created() {
    if (!this.isWxlogin) return
    this.getWxloginCode()
  },
  methods: {
    /**
     * @description: 获取微信登录二维码
     */

    async getWxloginCode() {
      this.loading = true
      const { data: res } = await (this.isBind ? bindWechatCode() : wxcode())
      this.loading = false

      if (res.code !== 1) return

      const obj = res.data || {}

      this.wxloginObj.appid = obj.appid
      this.wxloginObj.state = obj.state

      // 构造 redirect_uri
      const { href, search } = getLocation()
      let rUrl = href.replace(search, '')

      // 替换为自定义的 router
      if (this.routerUrl !== '') {
        rUrl = rUrl.replace(this.$route.path, this.routerUrl)
      }

      this.wxloginObj.redirect_uri = rUrl
      // this.wxloginObj.redirect_uri = `${this.$root.demoWebSite}/#/login'
    },

    /**
     * @description: 监听微信扫码
     */
    async listenCode() {
      const { data: res } = await listenWxcode({
        code: this.code,
        state: this.state
      })

      if (res.code !== 1) {
        // 清除路由地址参数
        this.$router.push({ query: {} })
        return
      }

      // 监听成功，执行后面的逻辑
      this.$emit('successListenCode', res)
    }
  }
}
</script>

<style lang="scss">
.wx-login-code {
  iframe {
    height: 230px !important;
    margin: 0 auto;
  }
}
</style>
