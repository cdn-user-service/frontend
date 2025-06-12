<template>
  <div>
    <el-card class="content-box">
      <table-query-form
        :queryInfo="queryInfo"
        @changeInput="getTableData"
        :search-arr="
              [
                {
                  name: '检索公司名称',
                  key: 'organizationName',
                  value: queryInfo.organizationName
                },
                {
                  name: '检索手机号',
                  key: 'organizationMobile',
                  value: queryInfo.organizationMobile
                }
              ]
        "
      >
        <template slot="buttons">
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="toEdit()"
            text="添加公司"
          />
          <ants-button
            size="small"
            type="info"
            icon="el-icon-delete"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="doBatchDel()"
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
          align="center"
          width="45"
        />
        <ants-table-column
          min-width="150"
          label="公司名称"
          prop="organizationName"
        >
        </ants-table-column>
        <ants-table-column
          min-width="150"
          label="公司电话"
          prop="organizationMobile"
        >
        </ants-table-column>
        <ants-table-column
          min-width="150"
          label="证件号码"
          prop="organizationRegNumber"
        >
        </ants-table-column>
        <ants-table-column
          min-width="150"
          label="所在国家"
          prop="organizationCountry"
        >
        </ants-table-column>
        <ants-table-column
          min-width="150"
          label="所在城市"
          prop="organizationCity"
        >
        </ants-table-column>
        <ants-table-column
          min-width="150"
          label="公司地址"
          prop="organizationAddress"
        >
        </ants-table-column>

        <ants-table-column
          min-width="100"
          label="邮编"
          prop="organizationPostCode"
        >
        </ants-table-column>

        <ants-table-column
          width="150"
          label="操作"
        >
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

    <FormDailog
      ref="FormDialogRef"
      @refresh="toQuery"
    />
  </div>
</template>

<script>
import FormDailog from './FormDialog.vue'

const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getSslOrganizationPage,
  doSaveOrganization,
  doDelSslOrganization
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
        organizationName: '',
        organizationMobile: ''
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
        const { data: res } = await getSslOrganizationPage(this.queryInfo)
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
        tag: '公司'
      })
      if (!result) return
      const { data: res } = await doDelSslOrganization({
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
        tag: '公司'
      })
      if (!result) return

      this.btnLoading = true

      try {
        const { data: res } = await doDelSslOrganization({
          ids: this.selection.map((item) => item.id) + ''
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

<style lang="scss" scoped>
</style>
