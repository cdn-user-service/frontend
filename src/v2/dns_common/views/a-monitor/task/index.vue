<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="isAdmin ? [
                {
                  name: '检索任务名称',
                  key: 'key',
                  value: queryInfo.key
                },
                {
                  name: '检索用户',
                  key: 'user',
                  value: queryInfo.user
                }
              ] :
              [
                {
                  name: '检索任务名称',
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
            size="small"
            type="primary"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="toAdd()"
            text="添加监控任务"
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
        <template slot="inputs">
          <el-select
            v-model="queryInfo.type"
            style="width:120px;"
            size="small"
            class="mr-df"
            @change="toQuery()"
          >
            <el-option
              value="all"
              label="全部监控"
            >
            </el-option>
            <el-option
              v-for="(item, key) in typeList"
              :key="key"
              :value="key"
              :label="item"
            >
            </el-option>
          </el-select>
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
        <!-- <ants-table-column
          width="80"
          label="ID"
          prop="id"
        /> -->
        <ants-table-column
          min-width="150"
          label="任务名称/ID"
          prop="name"
        >
          <template #default="{ row }">
            <div>
              <i
                class="el-icon-s-platform mr-3 text-ants-text-4 align-middle"
                style="font-size:16px;"
              ></i>
              <span
                class="text-primary cursor-pointer"
                @click="goMonitorDetailPage(row)"
              >{{row.name}}</span>
            </div>
            <div>
              ID：{{ row.id }}
            </div>
          </template>
        </ants-table-column>
        <ants-table-column
          min-width="150"
          label="监控记录"
          prop="record"
        >
          <template #default="{ row }">
            <div v-if="row.recordInfo">
              <div
                class="text-primary cursor-pointer"
                @click="goDnsRecord(row)"
              >
                {{ row.recordInfo.top + '.' + row.recordInfo.domain }}
              </div>
              <div>
                <span class="text-ants-text-4">线路类型：</span>
                {{ row.recordInfo.recordLineName }}
              </div>
              <!-- <div>
              <span class="text-ants-text-4">记录类型：</span>
              A
            </div> -->
              <!-- <div>
                <span class="text-ants-text-4">记录值：</span>
                {{ row.recordInfo.rdata }}
              </div> -->
            </div>

          </template>
        </ants-table-column>
        <ants-table-column
          width="160"
          label="用户"
          prop="userId"
          v-if="isAdmin"
        >
          <template #default="{ row }">
            <div>
              ID：{{ row.userId }}
            </div>
            <div>
              {{ row.userName }}
            </div>
          </template>
        </ants-table-column>
        <!-- <ants-table-column
          width="100"
          label="状态"
          prop="status"
        >
          <template #default="{ row }">
            <span
              v-if="row.status === 1"
              class="text-success el-icon-success"
            > {{ antsT('运行中')}}</span>
            <span
              v-else
              class="text-error el-icon-error"
            > {{ antsT('已停止')}}</span>
          </template>
        </ants-table-column> -->
        <ants-table-column
          width="100"
          label="类型"
          prop="type"
        >
          <template #default="{ row }">
            <el-tag
              type="primary"
              size="small"
            >{{ (row.type || '').toUpperCase() }}</el-tag>
          </template>
        </ants-table-column>
        <ants-table-column
          width="100"
          label="端口"
          prop="port"
        >
        </ants-table-column>
        <ants-table-column
          width="100"
          label="频率"
          prop="rate"
        >
          <template #default="{ row }">
            {{ row.rate >= 60 ? row.rate / 60 + ' 分钟' : row.rate + ' 秒' }}
          </template>
        </ants-table-column>

        <ants-table-column
          label="轮询IP"
          prop="pollIpSum"
          width="100"
        >
          <template #default="{ row }">
            <div>
              {{row.pollIpSum || 0}} 个
            </div>
          </template>
        </ants-table-column>

        <!-- <ants-table-column
          width="100"
          label="报警状态"
        >
          否
        </ants-table-column> -->
        <!-- <ants-table-column
          width="100"
          label="响应时间"
        >
          325ms
        </ants-table-column> -->
        <!-- <ants-table-column
          width="100"
          label="轮询IP"
        >
          <template #default="{ row }">
            <span>

            </span>
          </template>
        </ants-table-column> -->

        <ants-table-column
          width="120"
          label="切换规则"
          prop="rule"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.rule === 0 ? 'danger' : 'primary'"
              size="small"
            >{{ ruleList[row.rule] }}</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column
          width="80"
          label="启用/停止"
          align="center"
        >
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#DCDFE6"
              active-color="#13ce66"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>

        <ants-table-column
          label="操作"
          width="210"
          align="right"
          fixed="right"
        >
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="success"
              :disabled="btnLoading"
              @click="toPolling(row)"
              text="管理"
            />
            <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="toEdit(row)"
              text="设置"
            />
            <ants-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="toDel(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <FormDialog
      ref="FormDialogRef"
      @refresh="toQuery"
    />

    <UpdateDialog
      ref="UpdateDialogRef"
      @refresh="getTableData"
    />

    <PollingDialog
      ref="PollingDialogRef"
      @refresh="getTableData"
    />
  </div>
</template>

<script>
import PollingDialog from '@/v2/dns_common/views/domain-admin/record/PollingDialog.vue'
import FormDialog from './FormDialog/index.vue'
import UpdateDialog from './UpdateDialog/index.vue'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getTaskList,
  doDelTask,
  doToggleTaskStatus
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const typeList = {
  http: 'HTTP',
  https: 'HTTPS',
  ping: 'PING',
  tcp: 'TCP',
  udp: 'UDP'
  // dns: 'DNS'
}

const ruleList = {
  0: '关闭切换',
  1: '定时轮询',
  2: '优先级切换'
}

export default {
  components: {
    FormDialog,
    UpdateDialog,
    PollingDialog
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',

      typeList,
      ruleList,
      btnLoading: false,
      total: 0,
      queryInfo: {
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
        const { data: res } = await getTaskList(this.queryInfo)
        this.$root.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 轮询管理
    toPolling(row) {
      this.$refs.PollingDialogRef.show({
        id: row.rdataId,
        record_type: (row.recordInfo || {}).recordType
      })
    },

    // 前往添加监控任务
    toAdd() {
      this.$refs.FormDialogRef.show()
    },

    // 前往修改监控任务
    toEdit(row) {
      this.$refs.UpdateDialogRef.show({
        ...row,
        rdata: (row.recordInfo || {}).rdata
      })
    },

    // 删除
    async toDel(row) {
      const result = await this.$doDelete({
        name: row.name,
        tag: '监控任务'
      })
      if (!result) return
      const { data: res } = await doDelTask({
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
        tag: '监控任务'
      })
      if (!result) return

      this.btnLoading = true

      try {
        const { data: res } = await doDelTask({
          ids: this.selectArr.map((item) => item.id) + ''
        })
        this.btnLoading = false
        if (res.code !== 1) return
        this.$msg.success('删除成功')
        this.toQuery()
        this.selectArr = []
      } catch (error) {
        this.btnLoading = false
        throw error
      }
    },

    /**
     * @description: 开启-暂停解析
     * @param {*} row
     */

    async changeStatus(row) {
      if (row.status === 0) {
        const confirmResult = await this.$confirm(
          '此操作将停止监控任务“ <strong style="color: #F78989;"> ' +
            row.name +
            ' </strong> ”，是否继续？',
          '停止监控任务',
          {
            dangerouslyUseHTMLString: true,
            center: true,
            type: 'error'
          }
        ).catch((err) => err)
        if (confirmResult !== 'confirm') {
          row.status = 1
          this.$msg.info('已取消操作')
          return
        }
      }
      const { data: res } = await doToggleTaskStatus({
        id: row.id,
        status: row.status
      })
      if (res.code !== 1) {
        row.status = row.status === 1 ? 0 : 1
        return
      }
      this.$msg.success('操作成功')
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 前往记录管理页面
    goDnsRecord(row) {
      if (!row.recordInfo) return
      const { domainId, domain, userId } = row.recordInfo
      this.$router.push({
        name: 'DNSDomainRecord',
        params: {
          id: domainId,
          domain,
          userId
        }
      })
    },

    // 查看监控详情
    goMonitorDetailPage(row) {
      this.$router.push({
        name: 'RealTimeDetail',
        query: {
          id: row.id
        }
      })
    }
  }
}
</script>
