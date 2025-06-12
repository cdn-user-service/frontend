<template>
  <el-card class="animated fadeIn content-box" style="margin-top: 0">
    <table-query-form
      :search-arr="[
        isAdmin
          ? {
              name: '检索节点IP',
              key: 'hostname',
              value: queryInfo.hostname
            }
          : null,
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
      :showTableSetting="false"
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
          class="mr-sm"
        />

        <el-dropdown @command="toMark" placement="bottom" v-if="isAdmin">
          <ants-button
            size="small"
            type="info"
            :loading="$root.loading"
            :disabled="btnLoading"
            text="批量操作"
          >
            <i class="el-icon-arrow-down el-icon--right"></i>
          </ants-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="1">
              <i class="el-icon-check"></i>
              批量标记
            </el-dropdown-item>
            <el-dropdown-item :command="0">
              <i class="el-icon-close"></i>
              取消标记</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
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
          style="margin-right: 10px; width: 260px"
        />
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
      ref="AntsTableRef"
      :data="tableData"
      @getTableData="getTableData"
      @selection-change="handleSelectionChange"
      :total="total"
      :queryInfo="queryInfo"
      :max-height="tableMaxHeight"
      style="margin-top: -10px"
      row-key="id"
    >
      <ants-table-column type="selection" width="45" align="center" />

      <ants-table-column width="150" label="时间" prop="timestamp">
        <template #default="{ row }">
          <span :class="{ 'text-error': row.mark == 1 }">
            <template v-if="row.log_time">
              {{ row.log_time }}
            </template>
            <template v-else>
              {{ row.timestamp | dateFormat }}
            </template>
          </span>
        </template>
      </ants-table-column>

      <ants-table-column
        min-width="120"
        label="节点IP"
        prop="hostname"
        v-if="isAdmin"
      >
        <template #default="{ row }">
          <ants-copy
            :class="{ 'text-error': row.mark == 1 }"
            :text="row.hostname"
            inline
          />
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
          <ants-copy
            :class="{ 'text-error': row.mark == 1 }"
            :text="row[item] + ''"
            inline
          />
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
import SettingDialog from './SettingDialog.vue'
import FilterDrawer from './FilterDrawer.vue'
import { kName, kColumnDefault, kColumnWidth, kTips } from '../kname'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)
const { getIpArea } = require(`@/v2/${PROCESS_NAME}/api/public`)
const { getAllDomain } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  components: {
    SettingDialog,
    FilterDrawer
  },
  props: {
    // 查询指定域名
    domain: String
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      total: 0,
      queryInfo: {
        logType: 'ants_access',
        startDate: '', // 开始日期
        endData: '', // 结束日期
        // 检索节点IP
        hostname: '',
        // 检索来源IP
        k_ip: '',
        // 检索域名
        k_host: this.domain || '',
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
      },

      // 需要显示的表格列
      showTableColumns: kColumnDefault,
      kName,
      columnMinWidth: kColumnWidth,
      columnHeader: kTips,

      // 其他查询参数
      otherQuery: [],

      // 只有用户端才有，需要过滤过来
      userDomains: []
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
    const showTableColumns = localStorage.getItem(
      `${PROCESS_NAME}:showTableColumns`
    )
    if (showTableColumns) {
      this.showTableColumns = JSON.parse(showTableColumns)
    }

    // 用户端需要过滤域名
    if (!this.isAdmin && !this.domain) {
      this.getUserAllDomains()
      return
    }
    this.getTableData()
  },
  mounted() {},
  destroyed() {},
  methods: {
    // 获取用户所有的域名
    async getUserAllDomains() {
      this.$root.loading = true
      try {
        const { data: res } = await getAllDomain({
          igg: 0
        })
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
      localStorage.setItem(
        `${PROCESS_NAME}:showTableColumns`,
        JSON.stringify(checks)
      )
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
      console.log(startStr, endStr)

      const queryObj = {
        // 设置返回的最大条数，太大会影响性能
        track_total_hits: 100000,
        _source: {
          excludes: this.isAdmin
            ? [
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
            : ['message', 'host', 'agent', 'log', 'input', 'ecs']
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
            ],
            must_not: [
              // {
              //   wildcard: {
              //     k_url: {
              //       value: '*well-known/acme-challenge*'
              //     }
              //   }
              // }
            ]
          }
        },
        sort: [
          // {
          // '@timestamp': {
          // order: 'desc'
          // }
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
              value: `*${this.queryInfo.k_host.trim().toLowerCase()}*`
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
      if (this.queryInfo.hostname !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            'host.name': {
              value: `*${this.queryInfo.hostname.trim()}*`
            }
          }
        })
      }

      queryObj.query.bool.must = [
        ...queryObj.query.bool.must,
        ...this.otherQuery
      ]

      // 如果为用户端，需要过滤域名
      if (!this.isAdmin && !this.domain) {
        queryObj.query.bool.must.push({
          terms: {
            k_host: this.userDomains
          }
        })
      }

      // 如果为用户端，需要过滤掉主控
      if (!this.isAdmin) {
        queryObj.query.bool.must_not.push({
          wildcard: {
            k_url: {
              value: '*well-known/acme-challenge*'
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
    },

    // 批量标记
    async toMark(val) {
      console.log(val)
      const selectLength = this.selectArr.length
      if (!selectLength) {
        return this.$msg.warning(this.antsT('请勾选需要操作的数据'))
      }
      const title = val == 1 ? '批量标记' : '取消标记'
      const result = await this.$batchDelete(selectLength, {
        title,
        content: `此操作将${title} ${selectLength} 条数据，是否继续？`
      })
      if (!result) return
      this.btnLoading = true
      try {
        const postData = {
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
                  ids: {
                    values: this.selectArr.map((item) => item.id)
                  }
                }
              ]
            }
          },
          script: {
            // 追加 mark = 1 标记
            source: `ctx._source.mark = ${val}`,
            lang: 'painless'
          }
        }

        const { data: res } = await getElastic({
          uri: '.ds-filebeat-*/_update_by_query',
          method: 'POST',
          postData: JSON.stringify(postData)
        })
        if (res.code !== 1) return
        this.selectArr.forEach((item) => {
          item.mark = val
        })
        this.$msg.success('操作成功')
        this.selectArr = [] // 释放
        // 清除表格勾选
        this.$refs.AntsTableRef.$children[0].clearSelection()
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>
