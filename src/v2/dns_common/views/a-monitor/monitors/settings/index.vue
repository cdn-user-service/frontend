<template>
  <el-card class="animated fadeIn content-box">
    <table-query-form
      :search-arr="
        isAdmin
          ? [
              {
                name: '检索域名',
                key: 'domain',
                value: queryInfo.domain
              },
              {
                name: '检索用户',
                key: 'username',
                value: queryInfo.username
              }
            ]
          : [
              {
                name: '检索域名',
                key: 'domain',
                value: queryInfo.domain
              }
            ]
      "
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          size="small"
          type="success"
          :disabled="$root.loading"
          @click="blukUpdateStatus(1)"
        >
          <i class="aicon icon-zanting" style="font-size: 12px"></i>
          {{ antsT('继续监控') }}
        </ants-button>
        <ants-button
          size="small"
          type="primary"
          :disabled="$root.loading"
          @click="blukUpdateStatus(0)"
        >
          <i class="aicon icon-zanting1" style="font-size: 12px"></i>
          {{ antsT('暂停监控') }}
        </ants-button>

        <ants-button
          type="info"
          size="small"
          text="批量删除"
          :loading="btnLoading"
          :disabled="$root.loading"
          icon="el-icon-delete"
          @click="doBatchDel()"
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

      <ants-table-column label="ID" prop="id" width="60"> </ants-table-column>

      <ants-table-column label="域名" prop="domain" min-width="200">
        <template #default="{ row }">
          <span
            class="text-primary cursor-pointer hover:underline"
            @click="goDetail(row)"
          >
            {{ `${row.top}.${row.domain}` }}
          </span>
        </template>
      </ants-table-column>

      <ants-table-column label="记录类型" prop="recordType" min-width="100">
      </ants-table-column>

      <ants-table-column label="记录数" prop="recordCount" min-width="100">
      </ants-table-column>

      <ants-table-column label="taskMode" prop="taskMode" min-width="100">
        <template #default="{ row }">
          {{ taskModeName[row.taskMode] || '-' }}
        </template>
      </ants-table-column>

      <ants-table-column label="监控状态" prop="status" min-width="100">
        <template #default="{ row }">
          <span v-if="row.status == 1" class="text-success el-icon-success"
            >监控中</span
          >

          <span v-else class="text-info el-icon-error">已暂停</span>
        </template>
      </ants-table-column>

      <ants-table-column width="200" label="用户" prop="userId" v-if="isAdmin">
        <template #default="{ row }">
          <div>ID：{{ row.userId }}</div>
          <div>
            {{ row.username }}
          </div>
        </template>
      </ants-table-column>

      <ants-table-column label="暂停/开启" width="80">
        <template #default="{ row, $index }">
          <ants-table-switch
            v-model="row.status"
            inactive-color="#DCDFE6"
            active-color="#13ce66"
            :ref="`tableSwitchRef${$index}`"
            @change="switchStatus(row, `tableSwitchRef${$index}`)"
          />
        </template>
      </ants-table-column>

      <ants-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <ants-button
            type="primary"
            size="mini"
            text="监控"
            @click="toRules(row)"
          />
          <!-- <ants-button
            type="primary"
            size="mini"
            text="备IP"
            @click="toCustomLines(row)"
          /> -->
          <ants-button
            type="danger"
            size="mini"
            text="删除"
            @click="toDel(row)"
          />
        </template>
      </ants-table-column>
    </ants-table>

    <RuleDialog ref="RuleDialogRef" @refresh="refresh" />
  </el-card>
</template>

<script>
import RuleDialog from '../RuleDialog'

const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getRuleList,
  getCallbackInfo,
  updateStatus,
  deleteRule
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const taskModeName = {
  'no-change': '不切换',
  'smart-stop': '智能暂停',
  'smart-change': '智能切换',
  'self-define': '自定义切换'
}

export default {
  components: {
    RuleDialog
  },
  data() {
    return {
      taskModeName,
      isAdmin: PROCESS_NAME === 'dns_admin',
      btnLoading: false,
      total: 0,
      queryInfo: {
        domain: '',
        status: null,
        userId: 0,
        username: '',
        page: 1, // 当前的页数
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
    // 勾选
    handleSelectionChange(val) {
      this.selectArr = val
    },

    refresh() {
      this.getTableData()
    },

    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getRuleList(this.queryInfo)
        if (res.code !== 1) return
        const { list = [], totalCount = 0 } = res.data || {}
        this.tableData = list
        this.total = totalCount
      } finally {
        this.$root.loading = false
      }
    },

    // 前往详情页
    goDetail(item) {
      this.$router.push({
        path: './details',
        query: {
          id: item.id
        }
      })
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    toRules(row = {}) {
      this.$refs.RuleDialogRef.show(row)
    },

    toCustomLines(row = {}) {
      this.$router.push({ path: './custom-lines', query: { taskId: row.id } })
    },

    async toDel(row) {
      const result = await this.$doDelete({
        tag: '该监控'
      })
      if (!result) return
      const { data: res } = await deleteRule({
        ids: row.id
      })
      if (res.code !== 1) return
      this.$msg.success('删除成功')
      this.toQuery()
    },

    // 批量删除
    async doBatchDel() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '监控'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await deleteRule({
          ids: this.selectArr.map((item) => item.id) + ''
        })
        if (res.code !== 1) return
        this.$msg.success('删除成功')
        this.toQuery()
        this.selectArr = []
      } finally {
        this.btnLoading = false
      }
    },

    async switchStatus(row, tableSwitchRef) {
      this.$refs[tableSwitchRef].loading = true
      try {
        const { data: res } = await updateStatus({
          ids: row.id,
          status: row.status
        })
        if (res.code !== 1) {
          row.status = row.status === 1 ? 0 : 1
          return
        }
        this.$msg.success('操作成功')
      } finally {
        this.$refs[tableSwitchRef].loading = false
      }
    },

    // 批量暂停开启
    async blukUpdateStatus(status = 0) {
      const selectLength = this.selectArr.length
      if (!selectLength) return this.$msg.info('请勾选需要操作的数据')

      const txt = status ? '开启监控' : '暂停监控'

      this.$confirm(`该操作将批量${txt}，是否继续？`, '批量' + txt, {
        dangerouslyUseHTMLString: true,
        center: true,
        type: 'info',
        confirmButtonText: txt,
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '加载中...'

            try {
              const { data: res } = await updateStatus({
                ids: this.selectArr.map((it) => it.id) + '',
                status
              })
              if (res.code !== 1) {
                instance.confirmButtonText = '操作失败'
                return
              }

              instance.confirmButtonText = '操作成功'
              this.$msg.success('操作成功')
              this.selectArr = []
              this.getTableData()
              done()
            } finally {
              instance.confirmButtonLoading = false
            }
          } else {
            done()
          }
        }
      }).catch((err) => err)
    }
  }
}
</script>

<style lang="scss" scoped></style>
