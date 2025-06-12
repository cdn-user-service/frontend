<template>
  <div>
    <el-card class="animated fadeIn content-box">
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
            icon="el-icon-plus"
            size="small"
            :disabled="$root.loading"
            @click="doAddEdit()"
            text="添加分组"
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
        row-key="id"
      >
        <ants-table-column type="selection" width="50" align="center" />
        <ants-table-column prop="id" label="ID" width="100" />
        <ants-table-column prop="name" label="分组名称" min-width="140">
        </ants-table-column>
        
        <ants-table-column prop="nodeNum" label="节点数量" width="150">
          <template #default="{ row }">
            <el-tag size="mini" type="primary">
              {{  row.nodeNum || 0  }}
            </el-tag>
          </template>
        </ants-table-column>
        <ants-table-column prop="remark" label="备注信息" min-width="200">
        </ants-table-column>
        <ants-table-column label="操作" width="160" auto-fixed>
          <template #default="{ row }">
            <ants-button
              @click="doAddEdit(row)"
              :type="row.id == 0 ? 'info' : 'primary'"
              size="mini"
              text="修改"
              :disabled="row.id == 0"
            />
            <ants-button
              @click="singleDelete(row)"
              :type="row.id == 0 ? 'info' : 'danger'"
              :disabled="row.id == 0"
              size="mini"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <FormDialog ref="FormDialogRef" />
  </div>
</template>

<script>
// API
import {
  getNodeGroup,
  doDeleteNodeGroup
} from '@/v2/cdn_admin/api/cdn/node'

import FormDialog from './FormDialog.vue'

export default {
  components: { FormDialog },
  data() {
    return {
      btnLoading: false,
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
     * @description: 获取分组数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getNodeGroup(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      this.tableData = obj.list || []
      this.total = obj.totalCount || 0
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 添加、修改
    doAddEdit(row = {}) {
      this.$refs.FormDialogRef.show(row)
    },

    // 批量删除
    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '节点分组'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map(item => item.id)
      const { data: res } = await doDeleteNodeGroup({
        ids: idsArr + ''
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(selectLength + this.antsT('个节点分组已成功删除'))
      this.selectArr = [] // 释放
    },

    // 单个删除
    async singleDelete({ id, name }) {
      const result = await this.$doDelete({
        tag: '节点分组',
        name: name
      })
      if (!result) return
      this.btnLoading = true
      const { data: res } = await doDeleteNodeGroup({
        ids: id
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
    }
  }
}
</script>
