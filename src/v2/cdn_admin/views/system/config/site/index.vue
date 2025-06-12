<template>
  <horizontal-menu
    parent-path="/system/config/site/"
    :menu-list="menuList"
    title="网站配置"
    @getBasicConfig="getBasicConfig"
    @updateBasicConfig="updateBasicConfig"
  />
</template>

<script>
const defaultForm = {
  basic: {
    // 图标
    favicon: '',
    // 浅色logo base64
    logoImgLight: '',
    // 深色logo base64
    logoImgDark: '',
    // 网站名称
    webName: '',
    icp: '',
    isp: '',
    // 默认语言 cn = 中文， en = 英文
    lang: 'cn'
  },

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
    registerCommon: 0,
    // 是否禁用用户平台增删改功能，默认为不禁用
    disabledCrud: 0
  },

  seo: {
    title: '',
    keywords: '',
    description: ''
  },

  contact: {
    mobile: '',
    email: '',
    qq: '',
    company: '',
    telegram: '',
    skype: ''
  },

  agreement: ''
}
export default {
  data() {
    return {
      paramsId: 0,
      params: {
        id: 27,
        key: 'WEB_SITE_CONFIG_KEY',
        remark: '站点参数配置'
      },
      menuList: [
        {
          title: '基本设置',
          path: 'basic'
        },
        {
          title: '网站权限配置',
          path: 'power'
        },
        {
          title: 'SEO站内优化',
          path: 'seo'
        },
        {
          title: '联系方式',
          path: 'contact'
        },
        {
          title: '同意协议',
          path: 'agreement'
        },
        {
          title: '站点访问根目录',
          path: 'dir'
        }
      ],

      newForm: {}
    }
  },
  methods: {
    /**
     * @description: 获取数据
     */

    async getBasicConfig() {
      const res = await this.$root.getSystemConfigByParamKey(this.params.key)
      this.paramsId = res.data.id

      const FORM = {
        ...defaultForm,
        ...res.data
      }
      console.log(FORM)
      this.newForm = FORM
      return FORM
    },

    /**
     * @description: 更新数据
     */
    async updateBasicConfig(data) {
      const paramValueJSON = JSON.stringify({
        ...this.newForm,
        ...data
      })

      const { data: res } = await this.$root.updateSystemConfig({
        id: this.paramsId,
        paramKey: this.params.key,
        remark: this.params.remark,
        paramValue: paramValueJSON
      })

      return res
    }
  }
}
</script>
