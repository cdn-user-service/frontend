<template>
  <ants-form-card>
    <template slot="title">{{ antsT('选择精准访问控制规则') }}</template>

    <template slot="info">
      <ul class="space-y-4">
        <li>
          {{ antsT('通过精准访问控制，可以有效的拦截CC攻击和异常请求。') }}
        </li>
      </ul>
    </template>

    <template slot="content">
      <ul class="space-y-lg pubwaf-box">
        <li class="flex items-center">
          <span class="inline-block" style="min-width:80px;">系统规则</span>
          <ants-radio-group
            class="flex-1"
            v-model="selectWaf"
            @change="changePreciseWaf"
            :disabled="loading || $root.disabledCrud"
          >
            <ants-radio
              v-for="item in pubWafList"
              :key="item.id"
              :label="item.id"
              :text="item.name"
              size="small"
            />
          </ants-radio-group>
        </li>

        <li class="flex items-center">
          <span class="inline-block" style="min-width:80px;">自定义规则</span>
          <ants-radio-group
            class="flex-1"
            v-model="selectWaf"
            @change="changePriWaf"
            :disabled="$root.disabledCrud"
          >
            <ants-radio :label="0" text="自定义" size="small" />
          </ants-radio-group>
        </li>

        <template v-if="selectWaf == 0">
          <BuildWaf @refresh="refresh" v-on="$listeners" v-bind="$attrs" />
        </template>
      </ul>
    </template>
  </ants-form-card>
</template>

<script>
import BuildWaf from './BuildWaf'

export default {
  components: {
    BuildWaf
  },
  data() {
    return {
      loading: false,
      // 当前选中的规则
      selectWaf: null,

      // 通用规则
      pubWafList: [],
      // 其他站点自定义规则
      priWafList: [],
      // 多少个自定义WAF规则
      privateLength: 0
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await this.$listeners.getSiteDetail(
          'pub_precise_waf'
        )
        if (!res.attr.length) {
          this.pubWafList = []
          return
        }

        let pubPreciseWafArr = []
        let priPreciseWafArr = []
        res.attr.forEach(item => {
          // 通用规则
          if ('pub_precise_waf' in item) {
            pubPreciseWafArr = item.pub_precise_waf.map(item => {
              const obj = JSON.parse(item.pvalue)
              return {
                ...item,
                ...obj
              }
            })
          }

          // 其他站点规则
          if ('pri_precise_waf' in item) {
            priPreciseWafArr = item.pri_precise_waf || []
          }
        })

        this.pubWafList = pubPreciseWafArr.reverse()
        this.priWafList = priPreciseWafArr.reverse()
      } finally {
        this.loading = false
      }
    },

    /**
     * @description: 选择通用规则
     * @param {*} row
     */

    async changePreciseWaf(val) {
      const data = await this.$listeners.saveSiteAttr({
        pri_precise_waf_selects: val
      })

      if (data.code !== 1) return

      // 刷新自定义表格数据
      this.refresh()
    },

    // 刷新
    refresh() {
      this.$emit('refresh')
    },

    /**
     * @description: 选择自定义规则
     */

    async changePriWaf(val) {
      const data = await this.$listeners.saveSiteAttr({
        pri_precise_waf_user_selects: val
      })

      if (data.code !== 1) return

      // 如果切换为自定义规则，需要判断是否已设置有自定义的规则
      // if (val === 0 && !this.privateLength) {
      //   return this.$alert('您需要配置自定义精准访问规则！', '友情提示', {
      //     type: 'warning',
      //     center: true,
      //     callback: action => {
      //       // this.$router.push('./waf')
      //     }
      //   })
      // }

      // 刷新自定义表格数据
      this.refresh()
    }
  }
}
</script>

<style lang="scss">
.pubwaf-box {
  .el-radio--small.is-bordered {
    margin: 5px 10px 10px 0;
  }
  .el-radio {
    margin-bottom: 5px;
    margin-top: 5px;
  }
}
</style>
