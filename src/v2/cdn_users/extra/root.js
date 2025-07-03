// api
import { getUserInfo } from '../api/cdn/account'
import { getWebConfig } from '../api/public'
// 设置默认语言
import { setup } from '@/i18n'
import { $mode, debug, getBaseURL } from '@/utils/env'

const { apiRoot, baseURL } = require('../config/net.config')

const powerObj = JSON.parse(localStorage.getItem('cdn_users_power') || '{}')

console.log('cdn_user的 baseURL ', baseURL)
console.log('cdn_user的 apiRoot ', apiRoot)
console.log('cdn_user的 getBaseURL() ', getBaseURL())


const userinfo = {
  createTime: null,
  userId: null, // 用户ID
  username: null, // 用户名称
  mail: '', // 邮箱
  // 手机号
  mobile: 1,
  googleAuthStatus: 0,
  googleAuthSecretKey: null, // 绑定谷歌验证码
  note: null, //
  password: '', // 密码
  propertyBalance: 0, // 余额
  propertyScore: 0,

  // 是否实名认证 1 = 已实名， 0 = 未实名，初始设置为 2
  realnameStatus: 2,
  realnameCertificateid: null, // 身份证号
  realnameCertificatetype: 0, // 认证类型
  realnameName: null, // 姓名

  // 需要隐藏的菜单
  unvalidModel: [],
  whiteIpStatus: 0
}

export default {
  data: {
    loading: false,
    // 用户信息
    userinfo: {
      ...userinfo
    },
    // 金额单位
    priceUnit: (window.config || {}).priceUnit || '￥',

    // ants官方网站地址
    antsWebSite: 'https://www.antsxdp.com',
    // 演示站地址
    demoWebSite: 'https://demo.antsxdp.com',

    // 站点名称
    webName: 'CDN',
    // 站点协议加域名
    webRootSite: getBaseURL(),
    // 网站请求根路径
    // webRootApi: (debug ? 'http://localhost:8003' : getBaseURL()) + baseURL,
    webRootApi: 'http://localhost:8081' + apiRoot,

    // 当前站点配置信息
    webConfig: {
      // 基本配置信息
      basic: {
        // ico 图标
        favicon: localStorage.getItem('favicon') || '',
        // 浅色logo base64
        logoImgLight: localStorage.getItem('logoImgLight') || '',
        // 深色logo base64
        logoImgDark: localStorage.getItem('logoImgDark') || '',
        webName: '',
        icp: '',
        isp: '',
        // 默认语言 cn = 中文， en = 英文
        lang: 'cn'
      },
      // 站点权限信息
      power: {
        // 强制实名认证
        realName: 0,
        // 强制绑定手机号
        bindMobile: 0,
        // 停用业务
        stopWork: 0,
        // 是否开启注册功能, 0 = 开启， 1 = 关闭
        register: 0,
        // 是否开启普通账号注册功能
        registerCommon: 0,
        disabledCrud: 0
      },

      // seo
      seo: {
        title: '',
        keywords: '',
        description: '',
        telegram: '',
        skype: ''
      },
      // 联系信息
      contact: {
        mobile: '',
        email: '',
        qq: '',
        company: ''
      }
    },

    // 功能开关
    powerObj: {
      // 微信扫码登录， 默认为 0，这里做测试设为 1
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

      // 微信扫码支付, 默认为 0 ，做测试设为 1
      WXPAY_CONFIG_KEY: 0,
      // 阿里支付, 默认为 0 ，做测试设为 1
      ALIPAY_CONFIG_KEY: 0,
      // stripe支付
      STRIPE_PAY_CONF: 0,
      // tokenPay 支付
      TOKEN_PAY_CONF: 0,
      // 彩虹易支付
      CCCYUN_PAY_CONF: 0,
      // 通联支付
      ALLINPAY_PAY_CONF: 0,
      ...powerObj
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
      rewrite: 0,
      // 实名认证
      verify: 0,
      // 强制跳转
      force: 0,
      // DNS服务
      'access-token': $mode[176] ? 1 : 0
      // SSL证书
      // 防屏蔽
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
    },

    // 独有的功能：禁用前台用户 添加、修改、删除 功能，默认不禁用
    disabledCrud: false
  },
  methods: {
    // 获取站点配置信息
    getWebConfigData() {
      getWebConfig()
        .then(({ data: res, request, config }) => {
          // this.permission.all = 1
          // 跟请求路径
          if (process.env.NODE_ENV === 'production') {
            this.webRootApi = request.responseURL.replace(config.url, '')
          }
          // console.log('cdn-user的root的responseURL', request.responseURL)
          // console.log('cdn-user的root的config.url', config.url)
          // console.log('cdn-user的root的webrootapi', this.webRootApi)
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
          this.dns_rewrite = res.dns_rewrite || {}
          this.disabledCrud = this.webConfig.power.disabledCrud == 1

          // 定制版是否显示，URL转发模块
          this.custom.rewrite = (res.extra || {}).rewrite || 0
          this.custom.verify = this.webConfig.power.realName

          this.otherSite = {
            ...this.otherSite,
            ...res.dnsConf
          }

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

          this.powerObj = this.returnPowerObj(res.list)
          // 追加普通账号注册
          this.powerObj.REGISTER_COMMON =
            this.webConfig.power.registerCommon || 0
          // 保存到本地
          localStorage.setItem('cdn_users_power', JSON.stringify(this.powerObj))

          // logo 做一个本地缓存
          localStorage.setItem('webName', this.webName)
          localStorage.setItem(
            'logoImgLight',
            this.webConfig.basic.logoImgLight
          )
          localStorage.setItem('logoImgDark', this.webConfig.basic.logoImgDark)
          localStorage.setItem('favicon', this.webConfig.basic.favicon)

          // 设置默认语言，优先使用本地设置的语言，即默认语言仅在用户未设置本地语言时生效
          setup(
            localStorage.getItem('localeLanguage') || this.webConfig.basic.lang
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
      if (obj.ALIYUN_SMS_CONFIG_KEY || obj.SMS_BAO) {
        obj.SMS_CONFIG_KEY = 1
      }
      return obj
    },

    // 获取用户信息
    async getUserinfo() {
      const { data: res } = await getUserInfo()
      const { unvalidModel } = res.user || {}

      this.userinfo = {
        ...this.userinfo,
        ...res.user,
        // 菜单动态显示，该字段保存的是需要隐藏的菜单
        unvalidModel: unvalidModel ? unvalidModel.split(',') : []
      }

      // 过滤掉用户没有的模块
      const { userModuleVo } = this.userinfo
      // 强制跳转
      this.custom.force = (userModuleVo || {}).maxForceUrl || 0

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
