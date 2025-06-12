<template>
  <div class="animated fadeIn">
    <table-query-form>
      <template slot="buttons">
        <ants-button
          type="primary"
          size="small"
          plain
          icon="el-icon-back"
          :disabled="$root.loading"
          text="返回"
          @click="$router.push('../waf')"
        />
        <ants-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          :disabled="$root.loading"
          text="添加规则"
          @click="showCreateUpdateDialog()"
        />
        <ants-button
          type="info"
          size="small"
          icon="el-icon-delete"
          :disabled="$root.loading"
          :loading="btnLoading"
          @click="batchDelete"
          text="批量删除"
        />
      </template>
    </table-query-form>

    <WafTable
      @getTableData="getTableData"
      @changeWeight="changeWeight"
      @changeStatus="changeStatus"
      @singleDelete="singleDelete"
      @submitForm="submitForm"
      :showBotCheckHttpStatusCode="true"
      ref="WafTableRef"
    />
  </div>
</template>

<script>
import mixins from '../../../mixins'
import WafTable from '@/v2/cdn_common/components/Waf/Table'

export default {
  components: {
    WafTable
  },
  mixins: [mixins],
  data() {
    return {
      // 标识， [c_m_text]
      keyStr: 'web_rule_precise_detail',
      // 父ID
      parentId: this.$route.query.id
    }
  },
  created() {},
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      const { data: res } = await this.getGlobalKeyDetail(
        this.keyStr,
        this.parentId
      )
      if (!res) return

      const arr = res.map((item) => {
        const obj = JSON.parse(item.pvalue)
        return {
          ...item,
          ...obj
        }
      })

      // 表格子组件赋值
      this.$refs.WafTableRef.tableData = arr
      this.$refs.WafTableRef.total = arr.length
    },

    /**
     * @description: 添加对话框展示
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.WafTableRef.showCreateUpdateDialog({})
    },

    /**
     * @description: 权重修改
     */

    async changeWeight({ id, val }) {
      const data = await this.changeGlobalAttrWeight(id, val)
      return data
    },

    /**
     * @description: 状态改变
     */

    async changeStatus({ id, status }) {
      const data = await this.changeGlobalAttrStatus(status, this.keyStr, id)
      return data
    },

    /**
     * @description: 单个删除
     */

    async singleDelete(id) {
      const data = await this.deleteGlobalAttr(id, '规则')
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
      const data = await this.saveGlobalAttr({
        [this.keyStr]: [
          {
            parentId: this.parentId,
            // id, 添加时 = 0
            id,
            value: JSON.stringify({
              // 备注信息
              remark,
              // 匹配规则
              rule,
              // 处置方式
              waf_op: wafOp,
              // 触发模式
              req_sum_5s: reqSum5s,
              // 返回码
              botCheckHttpStatusCode: wafOp.botCheckHttpStatusCode
            })
          }
        ]
      })
      return data
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const idsArr = this.$refs.WafTableRef.selectArr.map((e) => {
        return e.id
      })

      const data = await this.deleteGlobalAttr(
        idsArr + '',
        '规则',
        this.$refs.WafTableRef.selectArr.length
      )
      if (!data) return
      this.getTableData()
      this.$refs.WafTableRef.selectArr = [] // 释放
    }
  }
}
</script>
