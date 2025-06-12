<template>
  <div class="animated fadeIn">
    <table-query-form
      :search-arr="[
        {
          name: '检索名称',
          key: 'key',
          value: queryInfo.key
        }
      ]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          :disabled="$root.loading"
          @click="showCreateUpdateDialog()"
          text="添加规则集"
        />

        <ants-button
          type="info"
          size="small"
          icon="el-icon-delete"
          :loading="btnLoading"
          :disabled="$root.loading"
          @click="batchDelete"
          text="批量删除"
        />
      </template>
    </table-query-form>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      @selection-change="handleSelectionChange"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column
        type="selection"
        width="45"
        align="center"
      ></ants-table-column>
      <ants-table-column label="ID" prop="id" width="80"></ants-table-column>
      <ants-table-column label="名称" min-width="140" prop="name">
      </ants-table-column>

      <ants-table-column label="描述" min-width="200" prop="remark">
      </ants-table-column>

      <ants-table-column label="更新时间" min-width="140" prop="updateTime">
      </ants-table-column>

      <ants-table-column prop="status" label="状态" min-width="60">
        <template #default="{ row, $index }">
          <ants-table-switch
            v-model="row.status"
            :ref="`tableSwitchRef${$index}`"
            @change="changeStatus(row, `tableSwitchRef${$index}`)"
          />
        </template>
      </ants-table-column>

      <ants-table-column label="操作" width="210">
        <template #default="{ row }">
          <ants-button
            size="mini"
            type="success"
            :disabled="btnLoading"
            @click="showRuleDialog(row)"
            text="规则"
          />
          <ants-button
            size="mini"
            type="primary"
            :disabled="btnLoading"
            @click="showCreateUpdateDialog(row)"
            text="修改"
          />
          <ants-button
            size="mini"
            type="danger"
            :disabled="btnLoading"
            @click="singleDelete(row)"
            text="删除"
          />
        </template>
      </ants-table-column>
    </ants-table>

    <!-- 添加修改规则集对话框 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" :key-str="keyStr" />

    <!-- 规则列表对话框 -->
    <RuleDialog ref="RuleDialogRef" />
  </div>
</template>

<script>
import CreateUpdateDialog from './components/CreateUpdateDialog'
import RuleDialog from './components/RuleDialog'

import mixins from '../../mixins'

export default {
  components: {
    CreateUpdateDialog,
    RuleDialog
  },
  mixins: [mixins],

  data() {
    return {
      // 标识， [m_text]
      keyStr: 'web_rule_regx',

      total: 0,
      queryInfo: {
        key: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      tableData: [],
      selectArr: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      const { data: res } = await this.getGlobalKeyDetail(this.keyStr)
      console.log(res)
      if (!res) return
      const arr = res.map(item => {
        const obj = JSON.parse(item.pvalue)
        return {
          ...item,
          ...obj
        }
      })
      this.tableData = arr.reverse()
      this.total = arr.length
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 显示规则集对话框
     * @param {*} row
     */

    showRuleDialog(row = {}) {
      this.$refs.RuleDialogRef.showDialog(row)
    },

    /**
     * @description: 添加修改对话框展示
     * @param {*} row
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const idsArr = this.selectArr.map(e => {
        return e.id
      })

      const data = await this.deleteGlobalAttr(
        idsArr + '',
        '规则集',
        this.selectArr.length
      )
      if (!data) return
      this.getTableData()
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete(row) {
      const data = await this.deleteGlobalAttr(row.id, '规则集')
      if (!data) return
      this.getTableData()
    },

    /**
     * @description: 切换状态
     * @param {*} row
     * @param {*} switchRef
     */

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用规则集',
          content: `此操作将禁用规则集“ <strong style="color: #F78989;">${row.name}</strong> ”，是否继续？`
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      const data = await this.changeGlobalAttrStatus(
        row.status,
        this.keyStr,
        row.id
      )
      this.$refs[switchRef].loading = false
      if (!data) {
        row.status = row.status ? 0 : 1
      }
    }
  }
}
</script>
