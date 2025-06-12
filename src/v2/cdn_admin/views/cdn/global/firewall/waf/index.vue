<template>
  <div>
    <div class="animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索分组名称',
            key: 'name',
            value: queryInfo.name
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :disabled="$root.loading"
            text="添加规则集"
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

        <ants-table-column prop="id" label="ID" min-width="80">
        </ants-table-column>
        <ants-table-column label="名称" prop="name" min-width="140">
        </ants-table-column>
        <!-- <ants-table-column label="规则数" prop="childs" min-width="100">
          <template #default="{ row }">
            <el-tag size="small" type="primary">{{ row.childs }}</el-tag>
          </template>
        </ants-table-column> -->
        <ants-table-column
          label="描述信息"
          prop="remark"
          min-width="200"
        ></ants-table-column>
        <ants-table-column prop="updateTime" label="更新时间" min-width="140">
        </ants-table-column>

        <ants-table-column width="120" label="优先级">
        <template #default="{ row }">
          <div
            class="space-x-2"
            v-loading="weightLoading"
            element-loading-spinner="el-icon-loading"
          >
            <span
              class="el-icon-upload2 text-2xl cursor-pointer hover:text-primary"
              @click="changeWeight(row.id, 0)"
            ></span>
            <span
              class="el-icon-top text-2xl cursor-pointer hover:text-primary"
              @click="changeWeight(row.id, 1)"
            ></span>
            <span
              class="el-icon-bottom text-2xl cursor-pointer hover:text-primary"
              @click="changeWeight(row.id, -1)"
            ></span>
          </div>
        </template>
      </ants-table-column>

        <el-table-column prop="status" label="启用" min-width="60">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </el-table-column>

        <ants-table-column label="操作" width="210" auto-fixed>
          <template #default="{ row }">
            <el-button
              size="mini"
              type="success"
              :disabled="btnLoading"
              @click="goRulesPage(row)"
              >规则</el-button
            >
            <el-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row)"
              >修改</el-button
            >
            <el-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              >删除</el-button
            >
          </template>
        </ants-table-column>
      </ants-table>
    </div>

    <!-- 添加、修改规则对话框 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" :key-str="keyStr" />
  </div>
</template>

<script>
import CreateUpdateDialog from './CreateUpdateDialog'

import mixins from '../../mixins'

export default {
  components: {
    CreateUpdateDialog
  },
  mixins: [mixins],
  data() {
    return {
      // 标识， [m_text]
      keyStr: 'web_rule_precise',
      // 排序按钮加载
      weightLoading: false,

      total: 0,
      queryInfo: {
        name: '',
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
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
      // this.tableData = arr.reverse()
      this.tableData = arr
      this.total = arr.length
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 添加、修改对话框展示
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 点击前往规则集页面
     */

    goRulesPage({ id }) {
      this.$router.push({ path: './waf/rules', query: { id } })
    },

    /**
     * @description: 权重修改
     */

    async changeWeight(id, val) {
      this.weightLoading = true
      const data = await this.changeGlobalAttrWeight(id, val)
      console.log(data)
      this.weightLoading = false

      // 刷新表格
      if (data) this.getTableData()
    },

    /**
     * @description: 状态改变
     * @param {*} row
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
    }
  }
}
</script>
