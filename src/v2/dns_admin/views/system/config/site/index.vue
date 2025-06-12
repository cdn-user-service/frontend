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
import { getConfigById, getConfigByKey } from '@/v2/dns_admin/api/system/config'

export default {
  data() {
    return {
      params: {
        id: 19,
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
          title: '站点访问路径',
          path: 'dir'
        }
      ],

      defaultForm: {
        basic: {
          favicon: '',
          // 浅色logo base64
          logoImgLight: '',
          // 深色logo base64
          logoImgDark: '',
          webName: '',
          icp: '',
          isp: ''
        },

        power: {
          // 实名认证
          realName: 0,
          // 强制绑定手机号
          bindMobile: 0,
          // 停用业务
          stopWork: 0,
          // 是否开启普通账号注册功能
          registerCommon: 0
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
          company: ''
        },

        agreement: ''
      },

      newForm: {}
    }
  },
  methods: {
    // 根据KEY获取配置数据
    async getBasicConfig(key) {
      const res = await this.$root.getSystemConfigByKey(this.params.key)
      const FORM = {
        ...this.defaultForm,
        ...res.data
      }
      this.newForm = FORM
      return FORM
    },

    /**
     * @description: 根据ID获取数据，不可靠
     */

    async _getBasicConfig() {
      const res = await this.$root.getSystemConfigById(this.params.id)

      const FORM = {
        ...this.defaultForm,
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
        id: this.params.id,
        paramKey: this.params.key,
        remark: this.params.remark,
        paramValue: paramValueJSON
      })

      return res
    }
  }
}
</script>
