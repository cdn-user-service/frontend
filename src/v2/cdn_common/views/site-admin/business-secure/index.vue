<template>
  <div>
    <XRobotsTag ref="XRobotsTagRef" v-on="$listeners" v-bind="$attrs" />

    <AccessControlAllowOrigin
      ref="AccessControlAllowOriginRef"
      v-on="$listeners"
      v-bind="$attrs"
    />

    <!-- <RefererCheck ref="RefererCheckRef" v-on="$listeners" v-bind="$attrs" /> -->

    <AntiTheftChain
      ref="AntiTheftChainRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refreshData="getSiteDetail"
    />

    <!-- <AreaShielding ref="AreaShieldingRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refreshData="getSiteDetail"
    /> -->
  </div>
</template>

<script>
import AntiTheftChain from './components/AntiTheftChain'
import XRobotsTag from './components/XRobotsTag'
import AccessControlAllowOrigin from './components/AccessControlAllowOrigin'
// import RefererCheck from './components/RefererCheck'
// import AreaShielding from './components/AreaShielding'

export default {
  components: {
    AntiTheftChain,
    XRobotsTag,
    AccessControlAllowOrigin
    // RefererCheck
    // AreaShielding
  },
  data() {
    return {
      form: {
        // 区域屏蔽，[bool]
        area_shielding: 0
      }
    }
  },
  created() {
    this.getSiteDetail()
  },
  methods: {
    // 获取站点配置数据
    async getSiteDetail() {
      const { data: res } = await this.$listeners.getSiteDetail('business')
      res.attr.forEach(item => {
        // 搜索引擎爬虫限制开关
        if (item.pkey === 'x_robots_tag') {
          this.$refs.XRobotsTagRef.status = +item.pvalue
          return
        }

        // 允许跨域开关
        if (item.pkey === 'access_control_allow_origin') {
          this.$refs.AccessControlAllowOriginRef.status = +item.pvalue
          return
        }

        // 来源控制子组件赋值
        if (item.pkey === 'referer_check') {
          this.$refs.RefererCheckRef.status = item.status
          const PVALUE = JSON.parse(item.pvalue || '{}')
          this.$refs.RefererCheckRef.form = {
            ...PVALUE,
            // 替换所有的 | ，为换行符
            refererUri: (PVALUE.refererUri || '').replace(/\|/g, '\n'),
            code: PVALUE.code + ''
          }
          return
        }

        // 给防盗链子组件赋值
        if (item.pkey === 'anti_theft_chain') {
          // 状态赋值
          this.$refs.AntiTheftChainRef.status = item.status
          const PVALUE = JSON.parse(item.pvalue)

          this.$refs.AntiTheftChainRef.form = {
            ...this.$refs.AntiTheftChainRef.form,
            ...PVALUE,
            match_domains: PVALUE.match_domains.replace(/ /g, '\n'),
            match_uri:
              PVALUE.match_uri_type == 1
                ? PVALUE.match_uri
                : PVALUE.match_uri.replace(/\|/g, '\n')
          }
          return
        }

        // 区域屏蔽子组件
        if (item.pkey === 'area_shielding') {
          this.$refs.AreaShieldingRef.status = item.status
          const PVALUE = JSON.parse(item.pvalue)
          this.$refs.AreaShieldingRef.form = {
            ...this.$refs.AreaShieldingRef.form,
            ...PVALUE
          }
        }
        // 如果存在值
        // if (item.pkey in this.form) {
        //   this.form[item.pkey] = item.pvalue
        // }
      })
    },

    // 单个保存
    doSave(key = '') {
      this.saveSiteAttr({
        [key]: this.form[key]
      })
    },

    // 保存配置数据
    async saveSiteAttr(dataObj) {
      const res = await this.$listeners.saveSiteAttr(dataObj)
    }
  }
}
</script>
