<template>
  <ants-form-card v-loading="$root.loading">
    <template slot="title">{{antsT('精准访问控制')}}</template>
    <template slot="info">
      <ul class="space-y-4">
        <li>
          {{antsT('通过精准访问控制，可以有效的拦截CC攻击和异常请求。')}}
        </li>
        <li>
          {{antsT('自定义配置，请跳转至')}}
          <router-link to="waf">{{antsT('精准访问控制')}}</router-link>
        </li>
      </ul>
    </template>
    <template slot="content">
      <ul class="space-y-8">
        <li>
          <ants-radio-group
            v-model="pri_precise_waf_selects"
            @change="changePreciseWaf"
          >
            <ants-radio
              v-for="item in pubWafList"
              :key="item.id"
              :label="item.id"
              :text="item.name"
            />
            <ants-radio :label="0" text="自定义" />
          </ants-radio-group>
        </li>
      </ul>
    </template>
  </ants-form-card>
</template>

<script>
export default {
  data() {
    return {
      // [int] 精准waf策略选择（自定义为0）,默认为不选中
      pri_precise_waf_selects: null,

      pubWafList: [],
      // 多少个自定义WAF规则
      privateLength: 0
    }
  },
  created() {
    this.getPrivateLength()
    this.getSelectWaf()
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     * @return {*}
     */

    async getTableData() {
      const { data: res } = await this.$listeners.getSiteDetail(
        'pub_precise_waf'
      )
      if (!res.attr.length) {
        this.pubWafList = []
        return
      }

      let pubPreciseWafArr = []
      res.attr.forEach(item => {
        if ('pub_precise_waf' in item) {
          pubPreciseWafArr = item.pub_precise_waf.map(item => {
            const obj = JSON.parse(item.pvalue)
            return {
              ...item,
              ...obj
            }
          })
        }
      })

      this.pubWafList = pubPreciseWafArr.reverse()
    },

    /**
     * @description: 获取当前选中的规则
     */

    async getSelectWaf() {
      const { data: res } = await this.$listeners.getSiteDetail(
        '',
        'pri_precise_waf_selects'
      )
      res.attr.forEach(item => {
        if (item.pkey === 'pri_precise_waf_selects') {
          this.pri_precise_waf_selects = +item.pvalue
        }
      })
    },

    /**
     * @description: 获取自定义规则的数量，用来判断是否可选择自定义
     */

    async getPrivateLength() {
      const { data: res } = await this.$listeners.getSiteDetail(
        '',
        'pri_precise_waf_details'
      )

      this.privateLength = res.attr.length || 0
      console.log(this.privateLength)
    },

    /**
     * @description: 切换状态
     * @param {*} row
     */

    async changePreciseWaf(val) {
      const data = this.$listeners.saveSiteAttr({
        pri_precise_waf_selects: val
      })
      
      // 如果切换为自定义规则，需要判断是否已设置有自定义的规则
      if (val === 0 && !this.privateLength) {
        return this.$alert(
          '您还未配置自定义精准访问规则，立即前往配置？',
          '友情提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            center: true,
            callback: action => {
              this.$router.push('./waf')
            }
          }
        )
      }
    }
  }
}
</script>
