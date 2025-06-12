// api
import {
  getConfigById,
  getConfigByParamKey,
  doUpdateConfig,
  toggleStatus
} from '../api/system/config'
import { getAdminInfo } from '../api/account/admins'
import { getWebConfig } from '../api/public/index'
// 设置默认语言
import { setup } from '@/i18n'
import { $mode, debug, getBaseURL } from '@/utils/env'

const { baseURL } = require('../config')

export default {
  data: {
    // 未购买系统授权弹窗
    isPayAuth: false,
    // 系统授权过期弹窗
    isPayAuthOver: false,
    // 系统授权数据
    authData: {
      endtime: 0
    },

    // 全局接口请求加载状态
    loading: false,
    // 金额单位
    priceUnit: (window.config || {}).priceUnit || '￥',

    // 当前管理员信息
    userinfo: {
      userId: '',
      username: '',
      whiteIpStatus: 0
    },

    // ants官方网站地址
    antsWebSite: 'https://www.antsxdp.com',
    // 演示站地址
    demoWebSite: 'https://demo.antsxdp.com',

    // 站点名称
    webName: 'CDN',
    // 站点协议加域名
    webRootSite: `${window.location.protocol}//${window.location.host}`,
    // 网站请求根路径
    webRootApi: (debug ? 'http://localhost:8002' : getBaseURL()) + baseURL,

    // 当前站点配置信息
    webConfig: {
      // 基本配置信息
      basic: {
        // ico 图标
        favicon: window.localStorage.getItem('favicon') || '',
        // 浅色logo base64
        // logoImgLight: window.localStorage.getItem('logoImgLight') || require('@/assets/img/logo-dark.png'),
        logoImgLight: window.localStorage.getItem('logoImgLight') || '',
        // 深色logo base64
        // logoImgDark: window.localStorage.getItem('logoImgDark') || require('@/assets/img/logo-light.png'),
        logoImgDark: window.localStorage.getItem('logoImgDark') || '',
        webName: '',
        icp: '',
        isp: '',
        // 默认语言 cn = 中文， en = 英文
        lang: 'cn'
      },
      // seo
      seo: {
        title: '',
        keywords: '',
        description: ''
      },
      // 联系信息
      contact: {
        mobile: '',
        email: '',
        qq: '',
        company: '',
        telegram: '',
        skype: ''
      },

      // 用户控制台地址
      userDir: ''
    },

    /** ============================================
     *   下面的值用来区分不同系统自定义的一些配置
     *  ============================================
     */
    // 侧边栏 badge 数字值
    menuBadge: {
      // 任务列表数
      task: 0,
      // 工单数量
      workOrder: 0
    },

    // 定制版，是否显示
    custom: {
      // URL转发模块
      rewrite: 0,
      // 强制跳转
      force: $mode['176_179'] ? 1 : 0,
      // DNS转发
      'dns-rewrite': $mode['176_179'] ? 1 : 0,
      'other-url': $mode[176] ? 1 : 0,
      // AI WAF
      ai_waf: 0
    },

    // DNS 强制跳转参数
    dns_rewrite: {
      cnameDomain: '',
      dnsAddress: ''
    },

    // DNS站点请求配置
    otherSite: {
      // DNS客户端地址
      siteUrl: '',
      // DNS接口请求根路径
      apiRootPath: '',
      // 异步注册开关
      syncRegister: 0
    }
  },
  methods: {
    // 获取站点配置信息
    getWebConfigData() {
      getWebConfig().then(({ data: res, request, config }) => {
        const webRootApi = request.responseURL.replace(config.url, '')
        if (this.webRootApi != webRootApi) {
          this.webRootApi = webRootApi
        }

        const obj = res.data || {}

        // 定制模块：URL转发模块
        this.custom.rewrite = obj.rewrite || 0
        // 定制模块：AI WAF
        this.custom.ai_waf = obj.ai_waf || 0

        // 用户站点存放路径
        this.webConfig.userDir = obj.user_dir

        // 工单数量
        this.menuBadge.workOrder = obj.wkCount || 0

        // console.log(res)
        if ((obj.web_config || {}).paramValue) {
          const webConfig = JSON.parse(obj.web_config.paramValue || '{}')
          // 提取公网安备案号
          if ((webConfig.basic || {}).isp) {
            webConfig.basic.isp_num = webConfig.basic.isp.match(/[0-9]+/g)
          }

          this.webConfig = {
            ...this.webConfig,
            ...webConfig
          }

          this.dns_rewrite = res.dns_rewrite || {}

          // 设置网站名称
          this.webName = this.webConfig.basic.webName

          // 站点SEO
          window.title = document.title = this.webConfig.seo.title || ''
          document.getElementById('description').content =
            this.webConfig.seo.description || ''
          document.getElementById('keywords').content =
            this.webConfig.seo.keywords || ''

          // favicon 图标
          const LINK_NODE_ARR = document.querySelectorAll('link[rel="icon"]')
          LINK_NODE_ARR[LINK_NODE_ARR.length - 1].href =
            this.webConfig.basic.favicon

          // 设置默认语言，优先使用本地设置的语言，即默认语言仅在用户未设置本地语言时生效
          setup(
            window.localStorage.getItem('localeLanguage') ||
              this.webConfig.basic.lang
          )

          // logo 做一个本地缓存
          window.localStorage.setItem('webName', this.webName)
          window.localStorage.setItem(
            'logoImgLight',
            this.webConfig.basic.logoImgLight
          )
          window.localStorage.setItem(
            'logoImgDark',
            this.webConfig.basic.logoImgDark
          )
          window.localStorage.setItem('favicon', this.webConfig.basic.favicon)
        }
      })
    },

    // 获取DNS客户端配置
    async getOhterSite() {
      const { data } = await this.getSystemConfigByParamKey(
        'DNS_USER_API_ROOT_URI'
      )
      this.otherSite = {
        ...this.otherSite,
        ...data
      }
    },

    // 获取当前登录账号信息
    async getUserinfo() {
      const { data: res } = await getAdminInfo()
      const { user = {} } = res || {}
      this.userinfo = {
        ...this.userinfo,
        ...user
      }
    },

    // 根据 id 获取系统设置具体参数值，暂时不用
    async getSystemConfigById(id) {
      this.loading = true
      const { data: res } = await getConfigById(id)
      this.loading = false
      if (res.code !== 1) return
      const config = res.config || {}
      const paramValue = JSON.parse(config.paramValue || '{}')
      const status = config.status || 0
      return { data: paramValue, status }
    },

    // 根据 id 获取系统设置具体参数值
    async getSystemConfigByParamKey(paramKey) {
      this.loading = true
      const { data: res } = await getConfigByParamKey(paramKey)
      this.loading = false
      if (res.code !== 1) return
      const config = res.config || {}
      const status = config.status || 0

      const paramValue = JSON.parse(config.paramValue || '{}')
      paramValue.id = config.id || 0
      return { data: paramValue, status }
    },

    // 更新系统各项配置
    async updateSystemConfig(
      config = {
        id: null,
        paramKey: null,
        remark: null,
        paramValue: null,
        weight: null
      }
    ) {
      const data = await doUpdateConfig(config)
      return data
    },

    // 根据 ID 开关配置状态
    async toggleSystemConfigStatus(id) {
      const data = await toggleStatus(id)
      return data
    }
  }
}
