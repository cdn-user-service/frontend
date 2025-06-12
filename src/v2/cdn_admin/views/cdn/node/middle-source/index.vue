<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索IP',
            key: 'ip',
            value: queryInfo.ip
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
            text="添加中间源"
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
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>

        <ants-table-column width="70" prop="id" label="ID"> </ants-table-column>
        <ants-table-column prop="ip" label="中间源" min-width="200">
        </ants-table-column>

        <ants-table-column prop="remark" label="备注信息" min-width="140">
        </ants-table-column>

        <ants-table-column prop="createTime" label="创建时间" min-width="140">
        </ants-table-column>

        <ants-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <span class="el-icon-success text-success" v-if="row.status === 1">
              正常</span
            >
            <span v-else class="el-icon-remove text-error"> 异常</span>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="160" auto-fixed>
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加中间源对话框 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" />
  </div>
</template>

<script>
// import { getNodeList, doDeleteNode } from '@/v2/cdn_admin/api/cdn/node'

import CreateUpdateDialog from './components/CreateUpdateDialog'
const mokeData = [
  {
    id: 11,
    ip: '23.23.23.23',
    status: 1,
    remark: '测试中间源',
    createTime: '2022-06-24 10:00:00'
  },
  {
    id: 12,
    ip: '23.23.23.23',
    status: 1,
    remark: '测试中间源',
    createTime: '2022-06-24 10:00:00'
  },
  {
    id: 13,
    ip: '23.23.23.23',
    status: 1,
    remark: '测试中间源',
    createTime: '2022-06-24 10:00:00'
  }
]
export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        ip: '',
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
      setTimeout(() => {
        this.$root.loading = false
        this.tableData = mokeData
      }, 1000)
      //   const { data: res } = await getNodeList(this.queryInfo)
      //   this.$root.loading = false
      //   if (res.code !== 1) return
      //   this.tableData = res.data.list || []
      //   this.total = res.data.totalCount
    },

    // 表格勾选
    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description: 添加、修改中间源对话框展示
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete({ id }) {
      const result = await this.$doDelete({
        tag: '中间源'
      })
      if (!result) return
      this.btnLoading = true
      //   const { data: res } = await doDeleteNode({
      //     id
      //   })
      this.btnLoading = false
      //   if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除中间源成功'))
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '中间源'
      })
      if (!result) return

      this.btnLoading = true
      // const idsArr = this.selectArr.map((item, index) => {
      //   return item.id
      // })
      // const { data: res } = await doDeleteCertify({
      //   ids: idsArr + ''
      // })

      this.btnLoading = false

      // if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(selectLength + this.antsT('个中间源已成功删除'))
      this.selectArr = [] // 释放
    }
  }
}
</script>
