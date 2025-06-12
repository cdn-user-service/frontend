<template>
  <el-dialog
    :title="antsT('选择域名')"
    :visible.sync="dialogVisible"
    width="500px"
    @closed="resetForm"
    center
    append-to-body
    top="10vh"
    class="select-domain-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div style="min-height: 400px" class="space-y-5">
      <div class="flex items-center justify-between">
        <el-input
          class="ants-search_input mr-xs"
          :placeholder="antsT('检索域名')"
          :clearable="false"
          v-model="queryInfo.domain"
          size="small"
          @change="changeInput"
        >
        </el-input>

        <el-input
          v-if="isAdmin"
          class="ants-search_input mr-xs"
          :placeholder="antsT('检索用户')"
          :clearable="false"
          v-model="queryInfo.user"
          size="small"
          @change="changeInput"
        >
        </el-input>
      </div>
      <el-table
        size="mini"
        :data="tableData"
        max-height="500px"
        @selection-change="handleSelectionChange"
        @row-click="onRowClick"
        border
        row-key="id"
        v-loading="loading"
        ref="tableRef"
      >
        <div slot="empty">
          <el-empty :description="antsT('还没有任何域名')"> </el-empty>
        </div>
        <ants-table-column
          type="selection"
          :reserve-selection="true"
          align="center"
          width="50"
          v-if="multiple"
        />
        <ants-table-column prop="domain" label="域名" min-width="200">
          <template #default="{ row }">
            <span v-if="multiple">{{ row.domain }}</span>
            <el-radio v-else v-model="currentRow.id" :label="row.id">
              {{ row.domain }}
            </el-radio>
          </template>
        </ants-table-column>
      </el-table>
      <el-pagination
        background
        :layout="
          layoutSizes ? 'total, prev, pager, next' : 'total, prev, pager, next'
        "
        :total="total"
        small
        :page-sizes="[10, 20, 50, 100, 200]"
        :page-size="queryInfo.limit"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
      />
    </div>

    <template slot="footer">
      <ants-button
        type="info"
        size="small"
        @click="dialogVisible = false"
        text="取 消"
      />
      <ants-button
        type="primary"
        :loading="btnLoading"
        :disabled="loading"
        size="small"
        @click="submit()"
        :text="multiple ? `选择(${selectArr.length})` : '选 择'"
      />
    </template>
  </el-dialog>
</template>

<script>
// api
const PROCESS_NAME = process.env.VUE_APP_NAME

const { getList } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

export default {
  name: 'SelectDomainDialog',
  props: {
    // 多选
    multiple: {
      type: Boolean,
      default: true
    },
    layoutSizes: Boolean,

    // 管理端
    username: [String, Number],
    // 禁用用户查询
    disabledUser: Boolean
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      loading: false,
      btnLoading: false,

      tableData: [],
      selectArr: [],
      total: 0,
      queryInfo: {
        user: '',
        domain: '',
        page: 1,
        limit: 200
      },
      currentRow: {}
    }
  },
  watch: {
    username: function (newVal) {
      if (!this.disabledUser) return

      if (!newVal) {
        this.tableData = []
        this.total = 0
        return
      }
      this.queryInfo.user = newVal
      this.getTableData()
    }
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    // 对话框显示
    showDialog() {
      this.dialogVisible = true
    },

    // 获取域名列表
    async getTableData() {
      this.loading = true
      const { data: res } = await getList(this.queryInfo)
      this.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}

      this.tableData = obj.list || []
      this.total = obj.totalCount || 0
    },

    /**
     * @description: 选择域名提交
     */

    submit() {
      // 多选
      if (this.multiple) {
        if (!this.selectArr.length) {
          return this.$msg.warning('请勾选至少一个域名')
        }
        this.btnLoading = true
        const domainsObj = {
          domains: [],
          domainIds: []
        }
        this.selectArr.forEach((item) => {
          domainsObj.domains.push(item.domain)
          domainsObj.domainIds.push(item.id)
        })
        // 暴露
        this.$emit('change', domainsObj)
        this.btnLoading = false
        this.dialogVisible = false
      } else {
        if (!this.currentRow.id) {
          return this.$msg.warning('请选择域名')
        }
        // 暴露
        this.$emit('change', {
          domains: [this.currentRow.domain],
          domainIds: [this.currentRow.id]
        })
        this.dialogVisible = false
      }
    },

    // 检索
    changeInput() {
      this.queryInfo.domain = this.queryInfo.domain.trim()
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 点击
    onRowClick(row) {
      this.currentRow = row
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 监听limit 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.limit = newSize
      this.getTableData()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.getTableData()
    },

    // 对话框关闭
    resetForm() {
      this.btnLoading = false
      // this.$refs.tableRef.clearSelection()
    }
  }
}
</script>

<style lang="scss">
.select-domain-dialog {
  .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 0;
  }
  .el-table .el-table__cell {
    padding: 4px 0;
  }
  .el-empty {
    padding: 10px 0;
  }
  .el-empty__description,
  .el-empty__bottom {
    margin: 0;
  }
}
</style>
