<template>
  <div>
    <PubPreciseWaf
      ref="PubPreciseWafRef"
      v-on="$listeners"
      v-bind="$attrs"
      @refresh="getTableData"
    />

    <ants-form-card v-if="!isDisabled">
      <template slot="title">
        {{ antsT('高级自定义精准访问规则') }}
      </template>
      <template slot="info">
        <div>
          {{
            antsT(
              '策略优先级按照排列顺序由上向下，禁用规则后，本规则不生效。最新增加的规则默认排序最靠前。'
            )
          }}
        </div>
      </template>

      <template slot="content">
        <ul class="space-y-8">
          <li class="" v-if="!$root.disabledCrud">
            <ants-button
              :type="isDisabled ? 'info' : 'primary'"
              size="small"
              icon="el-icon-plus"
              :disabled="isDisabled || $root.loading"
              text="添加自定义规则"
              @click="showCreateUpdateDialog()"
            />
          </li>

          <li>
            <WafTable
              @getTableData="getTableData"
              @changeWeight="changeWeight"
              @changeStatus="changeStatus"
              @singleDelete="singleDelete"
              @submitForm="submitForm"
              :is-disabled="isDisabled"
              ref="WafTableRef"
              @getSiteDetail="$listeners.getSiteDetail"
              @saveSiteAttr="$listeners.saveSiteAttr"
              showRewriteUrl
              :showReqSum="true"
              :rewriteUrl="form.rewrite_url"
            />
          </li>
        </ul>
      </template>
    </ants-form-card>

    <TokenSet v-on="$listeners" v-bind="$attrs" />
  </div>
</template>

<script>
import PubPreciseWaf from './components/PubPreciseWaf'
import TokenSet from './components/TokenSet'
import WafTable from '@/v2/cdn_common/components/Waf/Table'

export default {
  components: {
    PubPreciseWaf,
    WafTable,
    TokenSet
  },
  data() {
    return {
      keyStr: 'pri_precise_waf_details',
      // 当前选中的规则，用来判断是否提示用户
      pri_precise_waf_selects: 0,
      // 是否禁用掉 添加修改删除自定义规则
      isDisabled: false,

      form: {
        rewrite_url: '',
        referer_verify_url: ''
      },
      rules: {}
    }
  },
  created() {},
  methods: {
    // 获取配置数据
    async getTableData() {
      this.$nextTick(async () => {
        const { data: res } = await this.$listeners.getSiteDetail('waf')
        const arr = []

        let pubSelectWaf = 0
        let priSelectWaf = 0

        res.attr.forEach((item) => {
          const { pkey, pvalue } = item
          if (pkey == this.keyStr) {
            const obj = JSON.parse(pvalue || '{}')
            // id 用于编辑和删除
            obj.id = item.id
            obj.status = item.status
            obj.updateTime = item.update_time
            // 判断是否为自动生成的规则 = 1
            obj.pvalue1 = item.pvalue1

            arr.push(obj)
          }

          // 设置当前选中的规则的值，选中通用规则
          if (pkey === 'pri_precise_waf_selects') {
            pubSelectWaf = +pvalue
          }

          if (pkey === 'pri_precise_waf_user_selects') {
            // 设置当前选中的规则的值，选中自定义规则
            priSelectWaf = +pvalue
          }

          if (pkey === 'referer_verify_url') {
            this.form[pkey] = (pvalue || '').replace(/\|/g, '\n')
            return
          }

          // 如果存在值
          if (pkey in this.form) {
            this.form[pkey] = pvalue
          }
        })

        const selectWaf = pubSelectWaf || priSelectWaf
        this.$refs.PubPreciseWafRef.selectWaf = selectWaf
        this.$refs.PubPreciseWafRef.privateLength = arr.length
        // 为其他站点规则，则禁用掉自定义规则的操作
        this.isDisabled = selectWaf != 0

        // 表格子组件赋值
        if (this.$refs.WafTableRef) {
          this.$refs.WafTableRef.tableData = arr
          this.$refs.WafTableRef.total = arr.length
        }
      })
    },

    // 添加对话框展示
    showCreateUpdateDialog(row = {}) {
      this.$refs.WafTableRef.showCreateUpdateDialog({})
    },

    // 权重修改
    async changeWeight({ id, val }) {
      const data = await this.$listeners.changeSiteAttrWeight(
        this.keyStr,
        id,
        val
      )
      return data
    },

    // 状态改变
    async changeStatus({ id, status }) {
      const data = await this.$listeners.changeSiteAttrStatus({
        pkey: this.keyStr,
        attrId: id,
        status
      })
      return data
    },

    // 单个删除
    async singleDelete(id) {
      const data = await this.$listeners.deleteSiteAttr(this.keyStr, id)
      return data
    },

    /**
     * @description: 添加修改规则对话框表单提交
     * @param {*} remark 备注
     * @param {*} rule 匹配规则
     * @param {*} wafOp 处置方式
     * @return {*}
     */

    async submitForm({ id, remark, rule, wafOp, reqSum5s }) {
      const data = await this.$listeners.saveSiteAttr({
        [this.keyStr]: [
          {
            // id, 添加时 = 0
            id,
            // 备注信息
            remark,
            // 匹配规则
            rule,
            // 处置方式
            waf_op: wafOp,
            // 触发模式
            req_sum_5s: reqSum5s
          }
        ]
      })
      return data
    }
  }
}
</script>
