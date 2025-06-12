<template>
  <el-card class="animated fadeIn content-box" style="margin-top: 0">
    <table-query-form
      :search-arr="[
        {
          name: '检索来源IP',
          key: 'k_ip',
          value: queryInfo.k_ip
        },
        {
          name: '检索域名',
          key: 'k_host',
          value: queryInfo.k_host
        }
      ]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
      :showTableSetting="false"
    >
      <template slot="buttons">
        <ants-button
          size="small"
          type="success"
          :loading="loading"
          :disabled="btnLoading"
          @click="toQuery()"
          icon="el-icon-refresh"
          text="刷新"
        >
        </ants-button>
      </template>

      <template slot="inputs">
        <SelectNode @submit="selectNode" class="mr-sm" />
      </template>

      <template slot="settings">
        <el-badge
          :value="otherQuery.length"
          style="vertical-align: baseline"
          :hidden="!otherQuery.length"
        >
          <el-button size="small" type="primary" @click="toFilter()"
            >筛选</el-button
          >
        </el-badge>

        <el-button
          size="small"
          type="primary"
          @click="toSetting()"
          class="ml-sm"
          >设置</el-button
        >
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
      <ants-table-column min-width="120" label="节点IP" prop="hostname">
        <template #default="{ row }">
          <ants-copy :text="row.hostname" inline />
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

    <SettingDialog
      ref="SettingDialogRef"
      :kName="kName"
      @change="changeSetting"
    />
    <FilterDrawer ref="FilterDrawerRef" :kName="kName" @change="changeFilter" />
  </el-card>
</template>

<script>
import { calendarShortcuts } from '@/utils/shortcuts'
// 验证规则
import { isIpv4 } from '@/utils/validate'
import SettingDialog from '../query/access/SettingDialog.vue'
import FilterDrawer from '../query/access/FilterDrawer.vue'
import SelectNode from '@/v2/cdn_admin/views/cdn/node/es/Query/SelectNode.vue'
import { kName, kColumnDefault, kColumnWidth, kTips } from '../query/kname'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)
const { getIpArea } = require(`@/v2/${PROCESS_NAME}/api/public`)

export default {
  components: {
    SettingDialog,
    FilterDrawer,
    SelectNode
  },
  data() {
    return {
      total: 0,
      domain: '',
      queryInfo: {
        logType: 'ants_access',
        startDate: '', // 开始日期
        endData: '', // 结束日期
        // 检索节点IP
        hostname: [],
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

      // 其他查询参数
      otherQuery: [],
      timer: null,
      time: 5
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
    // 获取本地的设置
    const showTableColumns = localStorage.getItem('showTableColumns')
    if (showTableColumns) {
      this.showTableColumns = JSON.parse(showTableColumns)
    }
    this.getTableData()
    // this.setTimer()
  },
  mounted() {},
  destroyed() {
    this.clearTimer()
  },
  methods: {
    // 选择节点, 并查询数据
    selectNode(nodes = []) {
      this.queryInfo.hostname = nodes
      // 查询监控数据
      this.toQuery()
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    toFilter() {
      this.$refs.FilterDrawerRef.show()
    },

    changeFilter(queryBoolMust = []) {
      this.otherQuery = queryBoolMust
      this.toQuery()
    },

    toSetting() {
      this.$refs.SettingDialogRef.show(this.showTableColumns)
    },
    changeSetting(checks = []) {
      this.showTableColumns = checks
      // 保存到本地
      localStorage.setItem('showTableColumns', JSON.stringify(checks))
    },

    // 获取表格数据
    async getTableData() {
      this.loading = true
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

          arr.push({
            id: item._id,
            // 主机
            hostname: hostObj.name || hostObj.hostname || '',
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
        this.clearTimer()
        throw error
      } finally {
        this.loading = false
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
            'message',
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
                    gte: 'now-30s',
                    lte: 'now'
                  }
                }
              }
              // {
              //   regexp: {
              //     domain: '.*vedns.*|.*antsip.*'
              //   }
              // }
            ]
            // must_not: [
            //   {
            //     wildcard: {
            //       k_url: {
            //         value: '*well-known/acme-challenge*'
            //       }
            //     }
            //   }
            // ]
          }
        },
        sort: [
          // {
          //   '@timestamp': {
          //     order: 'desc'
          //   }
          // }
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

      // 检索，模糊查询节点IP
      if (this.queryInfo.hostname.length) {
        queryObj.query.bool.must.push({
          terms: {
            'host.name': this.queryInfo.hostname
          }
        })
      }

      queryObj.query.bool.must = [
        ...queryObj.query.bool.must,
        ...this.otherQuery
      ]

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
    },

    // 设置定时器，每5s刷新一次数据
    setTimer() {
      this.clearTimer()
      this.time--
      if (this.time === 0) {
        this.time = 5
        this.getTableData()
      }
      this.timer = setTimeout(this.setTimer, 1000)
    },

    clearTimer() {
      clearTimeout(this.timer)
    }
  }
}
</script>
