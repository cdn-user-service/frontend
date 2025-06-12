<template>
  <div>
    <el-card class="content-box">
      <table-query-form
        :queryInfo="queryInfo"
        @changeInput="getTableData"
        :search-arr="[
          {
            name: '检索联系人',
            key: 'name',
            value: queryInfo.name
          },
          {
            name: '检索手机号',
            key: 'mobile',
            value: queryInfo.mobile
          }
        ]"
      >
        <template slot="buttons">
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="toEdit()"
            text="添加联系人"
          />
          <ants-button
            size="small"
            type="info"
            icon="el-icon-delete"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="doBatchDel()"
            text="批量操作"
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
        <ants-table-column type="selection" align="center" width="45" />
        <ants-table-column min-width="150" label="组织名称" prop="organation">
        </ants-table-column>
        <ants-table-column min-width="100" label="名字" prop="firstName">
        </ants-table-column>
        <ants-table-column min-width="100" label="头衔" prop="job">
        </ants-table-column>
        <ants-table-column min-width="150" label="邮箱" prop="email">
        </ants-table-column>
        <ants-table-column min-width="150" label="手机号" prop="mobile">
        </ants-table-column>
        <ants-table-column min-width="150" label="地址" prop="address">
        </ants-table-column>

        <ants-table-column width="150" label="操作">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              text="修改"
              @click="toEdit(row)"
            />
            <ants-button
              size="mini"
              type="danger"
              text="删除"
              @click="toDel(row)"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <FormDailog ref="FormDialogRef" @refresh="toQuery" />
  </div>
</template>

<script>
import FormDailog from './FormDialog.vue'

const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getSslContactPage,
  doSaveSslContact,
  doDelSslContact
} = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

export default {
  components: {
    FormDailog
  },
  data() {
    return {
      btnLoading: false,
      tableData: [],
      selection: [],
      total: 0,
      queryInfo: {
        page: 1,
        limit: 20,
        name: '',
        mobile: ''
      }
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getSslContactPage(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 前往修改
    toEdit(row = {}) {
      this.$refs.FormDialogRef.show(row)
    },

    handleSelectionChange(val) {
      this.selection = val
    },

    // 删除
    async toDel(row) {
      const result = await this.$doDelete({
        name: row.name,
        tag: '联系人'
      })
      if (!result) return
      const { data: res } = await doDelSslContact({
        ids: row.id
      })
      if (res.code !== 1) return
      this.$msg.success('删除成功')
      this.toQuery()
    },

    // 批量删除
    async doBatchDel() {
      const selectLength = this.selection.length
      const result = await this.$batchDelete(selectLength, {
        tag: '联系人'
      })
      if (!result) return

      this.btnLoading = true

      try {
        const { data: res } = await doDelSslContact({
          ids: this.selection.map(item => item.id) + ''
        })
        if (res.code !== 1) return
        this.$msg.success('删除成功')
        this.toQuery()
        this.selection = []
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
