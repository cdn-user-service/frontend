<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="
          isAdmin
            ? [
                {
                  name: '检索域名',
                  key: 'key',
                  value: queryInfo.key
                },
                {
                  name: '检索用户',
                  key: 'user',
                  value: queryInfo.user
                }
              ]
            : [
                {
                  name: '检索域名',
                  key: 'key',
                  value: queryInfo.key
                }
              ]
        "
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            size="small"
            text="刷新"
            :loading="$root.loading"
            :disabled="btnLoading"
            icon="el-icon-refresh"
            @click="getTableData()"
          />
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="toAdd()"
            text="添加任务"
          />
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

        <ants-table-column label="ID" prop="taskId" width="60">
        </ants-table-column>

        <ants-table-column label="主机记录" prop="top" min-width="100">
        </ants-table-column>

        <ants-table-column label="域名" prop="domain" min-width="160">
        </ants-table-column>

        <ants-table-column label="记录类型" prop="type" min-width="100">
        </ants-table-column>

        <ants-table-column label="线路" prop="line" min-width="100">
        </ants-table-column>

        <ants-table-column label="TTL" prop="ttl" min-width="100">
          <template #default="{ row }">
            {{ row.ttl || '-' }}
            <span
              class="cursor-pointer text-primary pl-2"
              @click="toEditTTL(row)"
            >
              <i class="el-icon-edit" style="font-size:14px;"></i>
            </span>
          </template>
        </ants-table-column>

        <ants-table-column label="IP数" prop="ipCount" width="100">
          <template #default="{ row }">
            <div>{{ row.ipCount || 0 }} 个</div>
          </template>
        </ants-table-column>

        <ants-table-column label="IP离线数" prop="offIpCount" width="100">
          <template #default="{ row }">
            <div class="text-error">{{ row.offIpCount || 0 }} 个</div>
          </template>
        </ants-table-column>

        <ants-table-column label="检测时间" prop="publish" min-width="140">
          <template #default="{ row }">
            <span v-if="row.publish">
              {{ (row.publish * 1000) | dateFormat }}
            </span>
            <span v-else>-</span>
          </template>
        </ants-table-column>

        <ants-table-column label="检测状态" prop="status" min-width="70">
          <template #default="{ row }">
            <span
              v-if="
                row.publish &&
                  new Date().getTime() / 1000 - row.publish < 60 * 5
              "
              class="text-success"
            >
              <i class="el-icon-success" />
              正常
            </span>
            <span v-else class="text-error">
              <i class="el-icon-error" />
              异常
            </span>
          </template>
        </ants-table-column>

        <ants-table-column
          width="160"
          label="用户"
          prop="userId"
          v-if="isAdmin"
        >
          <template #default="{ row }">
            <div>ID：{{ row.userId }}</div>
            <div>
              {{ row.userName }}
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              text="管理"
              @click="toRules(row)"
            />
            <!-- <ants-button
              type="primary"
              size="mini"
              text="监控"
              @click="toMonitor(row)"
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
    </el-card>

    <CreateDialog ref="CreateDialogRef" @refresh="toQuery" />

    <MonitorDialog ref="MonitorDialogRef" @refresh="getTableData" />

    <EditTTL ref="EditTTLRef" @refresh="getTableData" />
  </div>
</template>

<script>
import CreateDialog from './CreateDialog'
import MonitorDialog from './MonitorDialog'
import EditTTL from './EditTTL'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getGtmTaskList,
  doDelGtmRule
} = require(`@/v2/${PROCESS_NAME}/api/dns/gtm`)

const typeList = {
  http: 'HTTP',
  https: 'HTTPS',
  ping: 'PING',
  tcp: 'TCP',
  udp: 'UDP'
  // dns: 'DNS'
}

const levelList = {
  1: '第一级',
  2: '第二级',
  3: '第三级',
  4: '第四级',
  5: '第五级'
}

const ruleObj = {
  1: '按权重切换',
  3: '固定周期切换',
  4: '自定义时间切换',
  5: '强制切换'
}

export default {
  components: {
    CreateDialog,
    MonitorDialog,
    EditTTL
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',

      typeList,
      levelList,
      ruleObj,
      btnLoading: false,
      total: 0,
      queryInfo: {
        level: 'all',
        key: '',
        user: '',
        type: 'all',
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
    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getGtmTaskList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        const arr = obj.records || []
        this.tableData = arr.map(item => {
          const recordArr = (item.taskTopTypeLine || '').split('#')
          const cbInfo = item.cbInfo || {}
          return {
            ...item,
            // IP离线数
            offIpCount: cbInfo.offIpCount || 0,
            // 最后监控时间
            publish: cbInfo.publish || 0,
            top: recordArr[0],
            type: recordArr[1],
            line: recordArr[2]
          }
        })
        this.total = obj.total || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 查询
    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 规则管理
    toRules(row) {
      this.$router.push({
        name: 'gtmRule',
        query: {
          taskId: row.taskId,
          type: row.type
        }
      })
    },

    // 监控管理
    toMonitor(row = {}) {
      this.$refs.MonitorDialogRef.show(row)
    },

    // 前往添加监控任务
    toAdd() {
      this.$refs.CreateDialogRef.show()
    },

    // 修改TTL
    toEditTTL(row) {
      this.$refs.EditTTLRef.show(row)
    },

    // 删除
    async toDel(row) {
      const result = await this.$doDelete({
        name: row.name,
        tag: '任务'
      })
      if (!result) return
      const { data: res } = await doDelGtmRule({
        taskIds: row.taskId
      })
      if (res.code !== 1) return
      this.$msg.success('删除成功')
      this.toQuery()
    },

    // 批量删除
    async doBatchDel() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '任务'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await doDelGtmRule({
          taskIds: this.selectArr.map(item => item.taskId) + ''
        })
        if (res.code !== 1) return
        this.$msg.success('删除成功')
        this.toQuery()
        this.selectArr = []
      } finally {
        this.btnLoading = false
      }
    },

    // 勾选
    handleSelectionChange(val) {
      this.selectArr = val
    }
  }
}
</script>
