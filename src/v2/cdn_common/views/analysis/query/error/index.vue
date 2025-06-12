<template>
  <el-card class="animated fadeIn content-box">
    <table-query-form
      :search-arr="[
        {
          name: '检索节点IP',
          key: 'hostname',
          value: queryInfo.hostname
        },
        {
          name: '检索日志信息',
          key: 'message',
          value: queryInfo.message
        }
      ]"
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
          <!-- {{ row.timestamp | dateFormat }} -->
          {{ row.timestamp }}
        </template>
      </ants-table-column>
      <ants-table-column width="140" label="节点IP" prop="hostname">
        <template #default="{ row }">
          <ants-copy :text="row.hostname" inline />
        </template>
      </ants-table-column>

      <ants-table-column min-width="300" label="日志信息" prop="message">
      </ants-table-column>
    </ants-table>
  </el-card>
</template>

<script>
import { calendarShortcuts } from '@/utils/shortcuts'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)
export default {
  data() {
    return {
      total: 0,
      domain: '',
      queryInfo: {
        logType: 'error',
        startDate: '', // 开始日期
        endData: '', // 结束日期
        // 检索节点IP
        hostname: '',
        // 检索日志信息
        message: '',
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
    this.getTableData()
  },
  methods: {
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
        const obj = JSON.parse(res.data)
        console.log(obj)

        const arr = []
        obj.hits.hits.forEach((item, idx) => {
          const source = item._source || {}
          const hostObj = source.host || {}
          const message = source.message || ''
          const timestamp = (message.match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/) || [])[0] || '-'
          arr.push({
            id: item._id,
            // 主机
            hostname: hostObj.name || hostObj.hostname || '',
            // 时间
            // timestamp: source['@timestamp'],
            // 通过正则检索时间 2024/08/07 00:11:11
            timestamp,
            ...source
          })

          // 获取来源IP的地区，只查询IPv4
          // if (isIpv4(source.query_machine)) {
          //   this.getIpAreaByIp(arr[idx])
          // }
        })
        console.log(arr)

        this.tableData = arr
        this.total = obj.hits.total.value
      } finally {
        this.$root.loading = false
      }
    },

    // 构造查询参数
    buildQueryObj() {
      // 开始时间字符串
      const startStr = this.$dayjs(this.datePicker[0]).format('YYYY-MM-DD')
      // 结束时间字符串
      const endStr = this.$dayjs(this.datePicker[1]).format('YYYY-MM-DD')

      const queryObj = {
        // 设置返回的最大条数，太大会影响性能
        track_total_hits: 100000,
        _source: {
          excludes: [
            'host.ip',
            'host.mac',
            'host.os',
            'host.id',
            'agent',
            'log',
            'input',
            'ecs'
          ]
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
            'host.name': {
              value: `*${this.queryInfo.hostname.trim()}*`
            }
          }
        })
      }

      // 检索，模糊查询日志信息
      if (this.queryInfo.message !== '') {
        // 使用 wildcard，有些特殊的字符查询不出来：
        // 将 '[', ']', ':' 转义为 \\[  \\] \\:
        const queryStr = this.queryInfo.message.trim()
        // const regArr = ['[', ']', ':', '#']
        // let newStr = queryStr
        // regArr.forEach(it => {
        //   // 全局替换并转义
        //   newStr = newStr.replace(new RegExp(`\\${it}`, 'g'), `\\\\${it}`)
        // })

        // queryObj.query.bool.must.push({
        //   query_string: {
        //     default_field: 'message',
        //     query: newStr,
        //     analyze_wildcard: true
        //   }
        // })
        queryObj.query.bool.must.push({
          match_phrase: {
            message: queryStr
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
