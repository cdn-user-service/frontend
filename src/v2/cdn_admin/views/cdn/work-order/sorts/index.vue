<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="showCreateUpdateDialog()"
            :disabled="$root.loading"
            text="添加分类"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column width="60" prop="id" label="ID"> </ants-table-column>
        <ants-table-column prop="title" label="分类名称" min-width="140">
        </ants-table-column>
        <ants-table-column prop="description" label="说明信息" min-width="200">
        </ants-table-column>
        <ants-table-column prop="weight" label="排序" min-width="100">
        </ants-table-column>
        <ants-table-column label="相关问题类型" min-width="100">
          <template #default="{ row }">
            <span
              class="cursor-color text-primary"
              @click="showItemListDialog(row)"
            >
              查看（{{ row.childCount || 0 }}）
            </span>
          </template>
        </ants-table-column>
        <ants-table-column label="启用" min-width="80">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加修改分类对话框 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" />
    <!-- 相关问题类型对话框 -->
    <ItemListDialog ref="ItemListDialogRef" />
  </div>
</template>

<script>
// API
import {
  getWorkOrderCategoryList,
  doSaveWorkOrderCategory,
  doDeleteWorkOrderCategory
} from '@/v2/cdn_admin/api/cdn/work-order'

import CreateUpdateDialog from './components/CreateUpdateDialog'
import ItemListDialog from './components/ItemListDialog'
export default {
  components: {
    CreateUpdateDialog,
    ItemListDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        name: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: []
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
      this.$root.loading = true
      const { data: res } = await getWorkOrderCategoryList({
        parentId: 0
      })
      this.$root.loading = false
      if (res.code !== 1) return
      this.tableData = res.data
      this.total = res.data.length
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description: 添加修改对话框显示
     * @param {*} row
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 相关问题类型对话框显示
     * @param {*} row
     */

    showItemListDialog(row = {}) {
      this.$refs.ItemListDialogRef.showDialog(row)
    },

    /**
     * @description: 启动禁用
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用工单类型',
          content: `此操作将禁用工单类型“ <strong style="color: #F78989;">${row.title}</strong> ”，是否继续？`
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      const { data: res } = await doSaveWorkOrderCategory(row)
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }

      // this.getTableData()
      this.$msg.success('操作成功')
    },

    /**
     * @description: 删除单个
     */

    async singleDelete({ id, title }) {
      const result = await this.$doDelete({
        tag: '分类',
        name: title
      })
      if (!result) return

      const { data: res } = await doDeleteWorkOrderCategory({
        id
      })
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
    },

    /**
     * @description: 批量清除日志
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '日志'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      //   const { data: res } = await doDelete({
      //     ids: idsArr + ''
      //   })

      //   this.btnLoading = false

      //   if (res.code !== 1) return
      //   this.getTableData()
      //   this.$msg.success(selectLength + this.antsT('个日志已成功删除 '))
      //   this.selectArr = [] // 释放
    }
  }
}
</script>
