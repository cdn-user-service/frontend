<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索域名',
            key: 'domain',
            value: queryInfo.domain
          },
          {
            name: '检索节点IP',
            key: 'host',
            value: queryInfo.host
          },
          {
            name: '检索来源IP',
            key: 'query_machine',
            value: queryInfo.query_machine
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            size="small"
            type="success"
            icon="el-icon-refresh"
            :loading="$root.loading"
            :disabled="btnLoading"
            @click="getTableData()"
            text="刷新"
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
      >
        <ants-table-column type="selection" width="45" align="center" />
        <ants-table-column min-width="140" label="时间" prop="timestamp">
          <template #default="{ row }">
            {{ row.timestamp | dateFormat }}
          </template>
        </ants-table-column>
        <ants-table-column min-width="140" label="域名" prop="domain">
        </ants-table-column>

        <ants-table-column
          width="100"
          label="记录类型"
          prop="query_type"
        ></ants-table-column>

        <ants-table-column
          min-width="140"
          label="节点IP"
          prop="host"
        ></ants-table-column>

        <ants-table-column
          min-width="140"
          label="请求源"
          prop="query_machine"
        ></ants-table-column>

        <ants-table-column
          min-width="140"
          label="来源区域"
          prop="query_machine_area"
        >
          <template #default="{ row }">
            <div
              v-loading="row.queryMachineLoading"
              element-loading-spinner="el-icon-loading"
            >
              <div>
                {{ row.query_machine_area || '-' }}
              </div>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column min-width="150" label="请求数据" prop="data">
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
import { exportXLSX } from '@/utils/download'
import { calendarShortcuts } from '@/utils/shortcuts'

// 验证规则
import { isIpv4 } from '@/utils/validate'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/dns/monitor`)
const { getIpArea } = require(`@/v2/${PROCESS_NAME}/api/public`)

export default {
  components: {},
  data() {
    return {
      total: 0,
      domain: '',
      queryInfo: {
        startDate: '', // 开始日期
        endData: '', // 结束日期
        host: '',
        domain: '',
        query_machine: '',
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
  created() {
    this.getTableData()
  },
  mounted() {},
  methods: {
    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      const { page, limit } = this.queryInfo
      const { data: res } = await getElastic({
        uri: `all-log/_search?size=${limit}&from=${(page - 1) * limit}`,
        postData: JSON.stringify(this.buildQueryObj())
      })
      this.$root.loading = false
      if (!res.data) return

      // 如果有数据
      const obj = JSON.parse(res.data)
      console.log(obj)

      const arr = []
      obj.hits.hits.forEach((item, idx) => {
        const source = item._source || {}
        arr.push({
          id: item._id,
          // 时间
          timestamp: source.timestamp,
          // 域名
          domain: source.domain,
          // 记录类型
          query_type: source.query_type,
          // 请求源
          query_machine: source.query_machine,
          query_machine_area: '',
          queryMachineLoading: false,
          // 节点IP
          host: source.host,
          // 数据
          data: source.data
        })

        // 获取来源IP的地区，只查询IPv4
        if (isIpv4(source.query_machine)) {
          this.getIpAreaByIp(arr[idx])
        }
      })

      this.tableData = arr
      this.total = obj.hits.total.value
    },

    // 构造查询参数
    buildQueryObj() {
      // 开始时间字符串
      const startStr = this.$dayjs(this.datePicker[0]).format('YYYY-MM-DD')
      // 结束时间字符串
      const endStr = this.$dayjs(this.datePicker[1]).format('YYYY-MM-DD')
      console.log(startStr, endStr)

      const queryObj = {
        query: {
          bool: {
            must: [
              {
                range: {
                  timestamp: {
                    gte: `${startStr} 00:00:00`,
                    lte: `${endStr} 23:59:59`,
                    format: 'yyyy-MM-dd HH:mm:ss',
                    // 时区
                    time_zone: '+08:00'
                  }
                }
              }
              // {
              //   regexp: {
              //     domain: '.*vedns.*|.*antsip.*'
              //   }
              // }
            ]
          }
        },
        sort: [
          {
            timestamp: {
              order: 'desc'
            }
          }
        ]
      }

      // 搜索框，模糊查询域名
      if (this.queryInfo.domain !== '') {
        queryObj.query.bool.must.push({
          // wildcard: {
          //   'domain.keyword': {
          //     value: `*${this.queryInfo.domain.trim()}*`
          //   }
          // }
          regexp: {
            domain: `.*${this.queryInfo.domain.trim().toLowerCase()}.*`
          }
        })
      }

      // 搜索框，模糊查询来源IP
      if (this.queryInfo.query_machine !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            'query_machine.keyword': {
              value: `*${this.queryInfo.query_machine.trim()}*`
            }
          }
        })
      }

      // 检索，模糊查询节点IP
      if (this.queryInfo.host !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            'host.keyword': {
              value: `*${this.queryInfo.host.trim()}*`
            }
          }
        })
      }

      return queryObj
    },

    // 根据IP地址获取区域信息
    async getIpAreaByIp(row) {
      row.queryMachineLoading = true
      try {
        const { data: res } = await getIpArea({
          ip: row.query_machine
        })
        row.queryMachineLoading = false
        if (res.code !== 1) return
        row.query_machine_area = res.data
      } catch (error) {
        row.queryMachineLoading = false
        throw error
      }
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
