// api
import { getUserInfo } from '../api/dns/account'
import { getWebConfig } from '../api/public'
// 设置默认语言
import { setup } from '@/i18n'
import { $mode, debug, getBaseURL } from '@/utils/env'
const { baseURL } = require('../config')

const userinfo = {
  createTime: null,
  userId: null, // 用户ID
  username: null, // 用户名称
  mail: '', // 邮箱
  mobile: 1, // 手机号
  note: null, //
  password: '', // 密码
  propertyBalance: 0, // 余额
  propertyScore: 0,

  realnameStatus: 1, // 是否实名认证
  realnameCertificateid: null, // 身份证号
  realnameCertificatetype: 0, // 认证类型
  realnameName: null // 姓名
}

export default {
  data: {
    // 金额单位
    priceUnit: (window.config || {}).priceUnit || '￥',
    avatarImg: require('@/assets/img/avatar.png'), // 用户头像图片
    ants_base_color: '#177DFF', // 主题颜色

    // 用户信息
    userinfo: {
      ...userinfo
    },

    // 站点基本配置吗，及权限
    config: {
      enable_reg: 1, // 是否开启注册功能, 默认为 0 ，这里做测试设为 1
      realname: 1 // 是否开启实名
    },

    // 全局加载样式
    loading: false,
    // 全局分页数据
    pageData: {
      pageSizes: [10, 20, 50, 100, 200],
      layout: 'total, sizes, prev, pager, next, jumper',
      pagesize: 50 // 当前每页显示多少条数据
    },

    // ants官方网站地址
    antsWebSite: 'https://www.antsxdp.com',
    // 演示站地址
    demoWebSite: 'https://www.vedns.com',

    // 站点配置信息
    webName: 'DNS', // 网站名称
    antsSite: `${window.location.protocol}//${window.location.host}`,
    // 站点协议加域名
    webRootSite: `${window.location.protocol}//${window.location.host}`,
    webRootApi: (debug ? 'http://localhost:8005' : getBaseURL()) + baseURL,

    webConfig: {
      // 基本配置信息
      basic: {
        // ico 图标
        favicon: window.localStorage.getItem('favicon') || '',
        // 浅色logo base64
        logoImgLight: window.localStorage.getItem('logoImgLight') || '',
        // 深色logo base64
        logoImgDark: window.localStorage.getItem('logoImgDark') || '',
        webName: '',
        icp: '',
        isp: '',
        // 默认语言 cn = 中文， en = 英文
        lang: 'cn'
      },
      // 站点权限信息
      power: {
        // 实名认证
        realName: 0,
        // 强制绑定手机号
        bindMobile: 0,
        // 停用业务
        stopWork: 0,
        // 是否开启注册功能, 0 = 开启， 1 = 关闭
        register: 0,
        // 是否开启普通账号注册功能
        registerCommon: 0
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
      }
    },

    // 功能开关
    powerObj: {
      // 微信扫码登录
      WXLOGIN_CONFIG_KEY: 0,
      // 腾讯短信，登录注册， TODO：现在这状态不是开启短信登录的标识
      SMS_CONFIG_KEY: 1,
      // 阿里短信
      ALIYUN_SMS_CONFIG_KEY: 0,
      // 短信宝短信
      SMS_BAO: 0,
      // 腾讯邮件，登录注册， TODO：现在这状态不是开启邮件登录的标识
      MAIL_CONFIG_KEY: 1,

      // 腾讯人脸核身配置
      TENCENTUSERCERTIFY_CONFIG_KEY: 1,
      // 支付宝实人认证
      ALIPAYUSERCERTIFY_CONFIG_KEY: 1,

      // 微信扫码支付
      WXPAY_CONFIG_KEY: 0,
      // 阿里支付
      ALIPAY_CONFIG_KEY: 0,
      // stripe支付
      STRIPE_PAY_CONF: 0,
      // tokenPay 支付
      TOKEN_PAY_CONF: 0,
      // 彩虹易支付
      CCCYUN_PAY_CONF: 0,
      // 通联支付
      ALLINPAY_PAY_CONF: 0
    },

    /** ============================================
     *   下面的值用来区分不同系统自定义的一些配置
     *  ============================================
     */
    // 侧边栏 badge 数字值
    menuBadge: {
      // 任务列表数
      message: 0
    },

    // 定制版，是否显示
    custom: {
      // URL转发模块
      // rewrite: 0,
      // 实名认证
      verify: 0,
      // DNS服务
      'access-token': $mode[176] ? 1 : 0,
      // A监控
      monitors: 0,
      // D监控
      gtm: 0,
      // sub菜单，调度管理
      'a-monitor': 0
    },

    // CDN站点请求配置
    otherSite: {
      // CDN客户端地址
      siteUrl: '',
      // CDN接口请求根路径
      apiRootPath: '',
      // 异步注册开关
      syncRegister: 0
    }
  },
  methods: {
    // 获取站点配置信息
    getWebConfigData() {
      getWebConfig()
        .then(({ data: res, request, config }) => {
          // 跟请求路径
          this.webRootApi = request.responseURL.replace(config.url, '')

          const webConfig = JSON.parse((res.data || {}).paramValue || '{}')

          // 提取公网安备案号
          if ((webConfig.basic || {}).isp) {
            webConfig.basic.isp_num = webConfig.basic.isp.match(/[0-9]+/g)
          }

          this.webConfig = {
            ...this.webConfig,
            ...webConfig
          }
          this.webName = this.webConfig.basic.webName

          // 定制页面
          const exclusiveMode = res.exclusive_mode || []
          // 定制页面：gtm
          this.custom.gtm = exclusiveMode.includes('dm') ? 1 : 0
          this.custom.monitors = exclusiveMode.includes('am') ? 1 : 0
          this.custom['a-monitor'] =
            this.custom.gtm || this.custom.monitors ? 1 : 0
          this.custom.verify = this.webConfig.power.realName

          this.otherSite = {
            ...this.otherSite,
            ...res.cdnConf
          }

          // 站点SEO
          document.title = this.webConfig.seo.title || ''
          document.getElementById('description').content =
            this.webConfig.seo.description || ''
          document.getElementById('keywords').content =
            this.webConfig.seo.keywords || ''

          // favicon 图标
          const LINK_NODE_ARR = document.querySelectorAll('link[rel="icon"]')
          LINK_NODE_ARR[LINK_NODE_ARR.length - 1].href =
            this.webConfig.basic.favicon

          this.powerObj = this.returnPowerObj(res.list)
          // 追加普通账号注册
          this.powerObj.REGISTER_COMMON =
            this.webConfig.power.registerCommon || 0

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

          // 设置默认语言，优先使用本地设置的语言，即默认语言仅在用户未设置本地语言时生效
          setup(
            window.localStorage.getItem('localeLanguage') ||
              this.webConfig.basic.lang
          )

          setTimeout(() => {
            // 如果后台禁用了注册功能，并且用户通过url 地址前往regiser页面，则强制跳转到登录页面
            if (
              this.webConfig.power.register == 1 &&
              this.$route.name === 'Register'
            ) {
              this.$router.replace('/login')
            }
          }, 50)
        })
        .catch((err) => err)
    },

    // 返回站点权限列表
    returnPowerObj(arr) {
      const obj = {}
      arr.forEach((item) => {
        obj[item.paramKey] = item.status
      })
      // 短信功能是否开启
      if (obj.ALIYUN_SMS_CONFIG_KEY || obj.SMS_BAO) {
        obj.SMS_CONFIG_KEY = 1
      }
      return obj
    },

    // 获取用户信息
    async getUserinfo() {
      const { data: res } = await getUserInfo()
      this.userinfo = {
        ...this.userinfo,
        ...res.user
      }
      return this.userinfo
    },

    // 重置用户信息
    resetUserinfo() {
      this.userinfo = {
        ...userinfo
      }
    }
  }
}
