<template>
  <el-card class="animated fadeIn">
    <table-query-form
      :search-arr="
        isAdmin
          ? [
              {
                name: '检索节点IP',
                key: 'hostname',
                value: queryInfo.hostname
              },
              {
                name: '检索来源IP',
                key: 'remote_addr',
                value: queryInfo.remote_addr
              },
              {
                name: '检索端口',
                key: 'server_port',
                value: queryInfo.server_port
              }
            ]
          : [
              {
                name: '检索端口',
                key: 'server_port',
                value: queryInfo.server_port
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
          :loading="$root.loading"
          :disabled="btnLoading"
          @click="toQuery()"
          text="刷新"
          icon="el-icon-refresh"
        />
      </template>
      <template slot="inputs">
        <el-date-picker
          v-model="datePicker"
          type="daterange"
          align="right"
          unlink-panels
          :range-separator="antsT('至')"
          :start-placeholder="antsT('开始日期')"
          :end-placeholder="antsT('结束日期')"
          :picker-options="datePickerOptions"
          size="small"
          :clearable="false"
          @change="changeDate"
          value-format="timestamp"
          style="margin-right:10px;width:260px;"
        />
      </template>
    </table-query-form>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      @selection-change="handleSelectionChange"
      :total="total"
      :queryInfo="queryInfo"
      :max-height="tableMaxHeight"
      style="margin-top:-10px;"
    >
      <ants-table-column type="selection" width="45" align="center" />
      <ants-table-column width="150" label="时间" prop="timestamp">
        <template #default="{ row }">
          <!-- {{ row.log_time }} -->
          {{ row.timestamp | dateFormat }}
        </template>
      </ants-table-column>
      <ants-table-column
        width="140"
        label="节点IP"
        prop="hostname"
        v-if="isAdmin"
      >
        <template #default="{ row }">
          <ants-copy :text="row.hostname" inline />
        </template>
      </ants-table-column>

      <ants-table-column width="140" label="来源IP" prop="remote_addr">
        <template #default="{ row }">
          <ants-copy :text="row.remote_addr" inline />
        </template>
      </ants-table-column>

      <ants-table-column min-width="200" label="区域" prop="area">
        <template #default="{ row }">
          <div
            v-loading="row.areaLoading"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0)"
          >
            <ants-copy :text="row.area || '-'" inline />
          </div>
        </template>
      </ants-table-column>

      <ants-table-column min-width="100" label="端口" prop="server_port">
      </ants-table-column>

      <ants-table-column min-width="100" label="协议" prop="protocol">
      </ants-table-column>

      <ants-table-column min-width="100" label="状态码" prop="status">
      </ants-table-column>

      <ants-table-column
        min-width="120"
        label="流入(byte)"
        prop="bytes_received"
      >
      </ants-table-column>

      <ants-table-column min-width="120" label="流出(byte)" prop="bytes_sent">
      </ants-table-column>
      <ants-table-column
        min-width="120"
        label="连接时长(秒)"
        prop="session_time"
      >
      </ants-table-column>
      <ants-table-column
        min-width="120"
        label="响应时间(秒)"
        prop="upstream_connect_time"
      >
      </ants-table-column>
    </ants-table>
  </el-card>
</template>

<script>
import { calendarShortcuts } from '@/utils/shortcuts'
import { isIpv4 } from '@/utils/validate'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)
const { getIpArea } = require(`@/v2/${PROCESS_NAME}/api/public`)
const { getAllPort } = require(`@/v2/${PROCESS_NAME}/api/cdn/stream`)

export default {
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      total: 0,
      queryInfo: {
        ports: [],
        logType: 'stream',
        startDate: '', // 开始日期
        endData: '', // 结束日期
        // 检索节点IP
        hostname: '',
        remote_addr: '',
        // 检索日志信息
        server_port: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      btnLoading: false,

      // 默认查询近一天的数据
      datePicker: [
        new Date().getTime() - 1000 * 3600 * 24,
        new Date().getTime()
      ],
      datePickerOptions: {
        shortcuts: calendarShortcuts,
        firstDayOfWeek: 1
      }
    }
  },
  computed: {
    // 表格最大高度
    tableMaxHeight() {
      const bodyHeight = document.body.clientHeight
      const trurHeight = bodyHeight - 310
      return trurHeight < 500 ? 500 : trurHeight
    }
  },
  created() {
    // 用户端需要过滤端口
    if (!this.isAdmin) {
      this.getUserAllPort()
      return
    }
    this.getTableData()
  },
  methods: {
    // 获取用户所有的端口
    async getUserAllPort() {
      this.loading = true
      try {
        const { data: res } = await getAllPort()
        if (res.code !== 1) {
          this.loading = false
          return
        }
        const arr = res.data || []
        if (!arr.length) {
          this.$root.loading = false
          this.loading = false
          return
        }

        this.queryInfo.ports = arr
        this.getTableData()
      } catch (err) {
        this.$root.loading = false
        this.loading = false
        throw err
      }
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { page, limit } = this.queryInfo
        const { data: res } = await getElastic({
          uri: `filebeat-*/_search?size=${limit}&from=${(page - 1) * limit}`,
          postData: JSON.stringify(this.buildQueryObj())
        })
        if (!res.data) return

        // 如果有数据
        const obj = JSON.parse(res.data || '{}')
        console.log(obj)

        const arr = []
        obj.hits.hits.forEach((item, idx) => {
          const source = item._source || {}
          const hostname = (source.agent || {}).name
          arr.push({
            id: item._id,
            // 主机
            hostname,
            // 时间
            timestamp: source['@timestamp'],
            ...source,
            // IP 区域
            areaLoading: false,
            area: ''
          })

          this.getIpAreaByIp(arr[idx])
        })

        this.tableData = arr
        this.total = obj.hits.total.value
      } finally {
        this.$root.loading = false
      }
    },

    // 根据IP地址获取区域信息
    async getIpAreaByIp(row) {
      // 获取来源IP的地区，只查询IPv4
      if (!isIpv4(row.remote_addr)) return

      row.areaLoading = true
      try {
        const { data: res } = await getIpArea({
          ip: row.remote_addr
        })
        if (res.code !== 1) return
        row.area = res.data
      } finally {
        row.areaLoading = false
      }
    },

    // 构造查询参数
    buildQueryObj() {
      // 开始时间字符串
      const startStr = this.$dayjs(this.datePicker[0]).format('YYYY-MM-DD')
      // 结束时间字符串
      const endStr = this.$dayjs(this.datePicker[1]).format('YYYY-MM-DD')

      const excludes = ['log', 'message', 'input', 'host']
      if (!this.isAdmin) {
        excludes.push('agent')
      }

      const queryObj = {
        // 设置返回的最大条数，太大会影响性能
        track_total_hits: 100000,
        _source: {
          excludes
        },
        query: {
          bool: {
            must: [
              {
                wildcard: {
                  'log.file.path': {
                    value: `*${this.queryInfo.logType}*`
                  }
                }
              },
              {
                range: {
                  '@timestamp': {
                    gte: `${startStr} 00:00:00`,
                    lte: `${endStr} 23:59:59`,
                    format: 'yyyy-MM-dd HH:mm:ss',
                    // 时区
                    time_zone: '+08:00'
                  }
                }
              }
            ]
          }
        },
        sort: [
          {
            '@timestamp': {
              order: 'desc'
            }
          }
        ]
      }

      // 检索，模糊查询节点IP
      if (this.queryInfo.hostname !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            'agent.name': {
              value: `*${this.queryInfo.hostname.trim()}*`
            }
          }
        })
      }

      // 检索，模糊查询来源IP
      if (this.queryInfo.remote_addr !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            remote_addr: {
              value: `*${this.queryInfo.remote_addr.trim()}*`
            }
          }
        })
      }

      // 检索，模糊查询日志信息
      if (this.queryInfo.server_port !== '') {
        // 使用 wildcard，有些特殊的字符查询不出来：
        queryObj.query.bool.must.push({
          wildcard: {
            server_port: {
              value: `*${this.queryInfo.server_port.trim()}*`
            }
          }
        })
      }

      // 如果为客户端，需要过滤用户的端口
      if (!this.isAdmin) {
        queryObj.query.bool.must.push({
          terms: {
            server_port: this.queryInfo.ports
          }
        })
      }

      return queryObj
    },

    // 查询时间
    changeDate(val) {
      this.queryInfo.page = 1
      this.getTableData()
    },

    handleSelectionChange(val) {
      this.selectArr = val
    }
  }
}
</script>
