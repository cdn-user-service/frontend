<template>
  <div>
    <ants-form-card>
      <template slot="title">防DDoS</template>
      <template slot="info">
        当前服务不支持，如遇 DDoS 攻击，
        {{ $root.webName }} 会将域名解析回源停止服务，您可以 联系商务
        开通此项功能
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.ddos"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('ddos')"
        />
      </template>
    </ants-form-card>

    <ants-form-card>
      <template slot="title">网络安全</template>
      <template slot="info">
        基于 DNS 安全流量接管，隐藏源服务器IP
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.dns"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="doSave('dns')"
        />
      </template>
    </ants-form-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        // 防DDoS, [bool]
        ddos: '0',
        // 网络安全, [bool]
        dns: '0'
      }
    }
  },
  created() {
    this.getSiteDetail()
  },
  methods: {
    /**
     * @description: 获取站点配置数据
     */

    async getSiteDetail() {
      const { data: res } = await this.$listeners.getSiteDetail('network')
      res.attr.forEach(item => {
        // 如果存在值
        if (item.pkey in this.form) {
          this.form[item.pkey] = item.pvalue
        }
      })
    },

    /**
     * @description: 单个保存
     * @param {*} key
     */

    doSave(key = '') {
      this.saveSiteAttr({
        [key]: this.form[key]
      })
    },

    /**
     * @description: 保存配置数据
     */

    async saveSiteAttr(dataObj) {
      const res = await this.$listeners.saveSiteAttr(dataObj)
    }
  }
}
</script>
