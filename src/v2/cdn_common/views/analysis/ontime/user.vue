<template>
  <el-card class="animated fadeIn content-box" style="margin-top: 0">
    <table-query-form
      :search-arr="[
        {
          name: '检索来源IP',
          key: 'k_ip',
          value: queryInfo.k_ip
        },
        domain
          ? null
          : {
              name: '检索域名',
              key: 'k_host',
              value: queryInfo.k_host
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
          icon="el-icon-refresh"
          text="刷新"
        />
      </template>

      <template slot="inputs" v-if="!hideTime">
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
          style="margin-right: 10px; width: 260px"
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
    >
      <!-- <ants-table-column type="selection" width="45" align="center" /> -->
      <ants-table-column width="150" label="时间" prop="timestamp">
        <template #default="{ row }">
          <template v-if="row.log_time">
            {{ row.log_time }}
          </template>
          <template v-else>
            {{ row.timestamp | dateFormat }}
          </template>
        </template>
      </ants-table-column>

      <ants-table-column
        v-for="item in showTableColumns"
        :key="item"
        :label="kName[item]"
        :prop="item"
        :min-width="columnMinWidth[item] || 90"
        show-overflow-tooltip
      >
        <template #header v-if="columnHeader[item]">
          <el-popover placement="bottom" width="220" trigger="hover">
            <ul class="space-y-sm text-sm">
              <li v-for="info in columnHeader[item]" :key="info">
                {{ info }}
              </li>
            </ul>
            <div slot="reference" class="cursor-pointer">
              {{ kName[item] }}
              <span class="text-primary el-icon-info"> </span>
            </div>
          </el-popover>
        </template>

        <template #default="{ row }">
          <ants-copy :text="row[item] + ''" inline />
        </template>
      </ants-table-column>
    </ants-table>
  </el-card>
</template>

<script>
import { calendarShortcuts } from '@/utils/shortcuts'
// 验证规则
import { isIpv4 } from '@/utils/validate'
import { kName, kColumnDefault, kColumnWidth, kTips } from '../query/kname'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)
const { getIpArea } = require(`@/v2/${PROCESS_NAME}/api/public`)
const { getAllDomain } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  components: {},
  props: {
    // 查询指定域名
    domain: String,
    // 隐藏时间查询 实时连接页面固定查询 30s 内的数据
    hideTime: Boolean
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        logType: 'ants_access',
        startDate: '', // 开始日期
        endData: '', // 结束日期
        // 检索来源IP
        k_ip: '',
        // 检索域名
        k_host: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      btnLoading: false,
      loading: false,

      // 默认查询近一天的数据
      datePicker: [
        new Date().getTime() - 1000 * 3600 * 24,
        new Date().getTime()
      ],
      datePickerOptions: {
        shortcuts: calendarShortcuts,
        firstDayOfWeek: 1
      },

      // 需要显示的表格列
      showTableColumns: kColumnDefault,
      kName,
      columnMinWidth: kColumnWidth,
      columnHeader: kTips,

      // 只有用户端才有，需要过滤过来
      userDomains: this.domain ? [this.domain] : []
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
    if (this.domain) {
      this.toQuery()
    } else {
      this.getUserAllDomains()
    }
  },
  mounted() {},
  destroyed() {},
  methods: {
    // 获取用户所有的域名
    async getUserAllDomains() {
      this.$root.loading = true
      try {
        const { data: res } = await getAllDomain({ igg: 0 })
        if (res.code !== 1) {
          this.$root.loading = false
          return
        }
        // 获取到的数据为一个对象，key为ID，value为域名，需要转换成数组
        const obj = res.data || {}
        const arr = []
        for (const key in obj) {
          arr.push(obj[key])
        }
        if (!arr.length) {
          this.$root.loading = false
          return
        }

        this.userDomains = arr
        this.getTableData()
      } catch (error) {
        console.log(error)
        this.$root.loading = false
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
        const obj = JSON.parse(res.data)
        console.log(obj)

        const arr = []
        obj.hits.hits.forEach((item, idx) => {
          const source = item._source || {}
          arr.push({
            id: item._id,
            // 时间
            timestamp: source['@timestamp'],
            ...source,
            // 请求url  k_uri + k_arg
            k_new_uri: `${source.k_uri || ''}${
              source.k_arg ? '?' + source.k_arg : ''
            }`
          })

          // 获取来源IP的地区，只查询IPv4
          // if (isIpv4(source.query_machine)) {
          //   this.getIpAreaByIp(arr[idx])
          // }
        })
        console.log(arr)

        this.tableData = arr
        this.total = obj.hits.total.value
      } catch (error) {
        clearInterval(this.timer)
        throw error
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
          includes: [
            '@timestamp',
            'k_ip',
            'k_host',
            'k_method',
            'k_uri',
            'k_arg',
            'k_user_agent',
            'k_geoip',
            'l_return_code',
            'k_ip_total',
            'l_upstream_status',
            'k_referer',
            'k_ip_1_sum',
            'k_server_5_sum',
            'k_ip_5_sum',
            'k_herd_cookies_success_sum'
          ]
        },
        query: {
          bool: {
            must: [
              // 只查询用户已有的域名
              {
                terms: {
                  k_host: this.userDomains
                }
              },
              {
                wildcard: {
                  'log.file.path': {
                    value: `*${this.queryInfo.logType}*`
                  }
                }
              },
              {
                range: {
                  '@timestamp': this.hideTime
                    ? {
                        gte: 'now-30s',
                        lte: 'now'
                      }
                    : {
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
            ],
            must_not: [
              {
                wildcard: {
                  k_url: {
                    value: '*well-known/acme-challenge*'
                  }
                }
              }
            ]
          }
        },
        sort: [
          // {
          //   '@timestamp': {
          //     order: 'desc'
          //   }
          // },
          {
            log_time: {
              order: 'desc'
            }
          }
        ]
      }

      // 搜索框，模糊查询域名
      if (this.queryInfo.k_host !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            k_host: {
              value: `*${this.queryInfo.k_host.trim()}*`
            }
          }
          // regexp: {
          //   k_host: `.*${this.queryInfo.k_host.trim().toLowerCase()}.*`
          // }
        })
      }

      // 搜索框，模糊查询来源IP
      if (this.queryInfo.k_ip !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            // 'k_ip.keyword': {
            //   value: `*${this.queryInfo.k_ip.trim()}*`
            // },
            k_ip: {
              value: `*${this.queryInfo.k_ip.trim()}*`
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
