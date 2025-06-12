<template>
  <el-card class="animated fadeIn content-box" style="margin-top:0;">
    <table-query-form
      :search-arr="[
        {
          name: '检索节点IP',
          key: 'hostname',
          value: queryInfo.hostname
        },
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
          :loading="$root.loading"
          :disabled="btnLoading"
          @click="toQuery()"
          text="刷新"
          icon="el-icon-refresh"
        />

        <ants-button
          size="small"
          type="primary"
          :loading="$root.loading"
          :disabled="btnLoading"
          text="生成AI模型"
          icon="el-icon-s-promotion"
          @click="toAiWafModel()"
          class="mr-sm"
        />

        <el-dropdown @command="toMark" placement="bottom">
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
          type="datetimerange"
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
          style="margin-right:10px;width:360px;"
        />
      </template>

      <template slot="settings">
        <el-badge
          :value="otherQuery.length"
          style="vertical-align: baseline;"
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
      style="margin-top:-10px;"
      row-key="id"
    >
      <ants-table-column type="selection" width="45" align="center" />

      <ants-table-column width="150" label="时间" prop="timestamp">
        <template #default="{ row }">
          <span :class="{ 'text-error': row.mark == 1 }">
            {{ row.timestamp | dateFormat }}
          </span>
        </template>
      </ants-table-column>
      <ants-table-column min-width="120" label="节点IP" prop="hostname">
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
            :text="row[item] + ''"
            :class="{ 'text-error': row.mark == 1 }"
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
import SettingDialog from '@/v2/cdn_common/views/analysis/query/access/SettingDialog.vue'
import FilterDrawer from '@/v2/cdn_common/views/analysis/query/access/FilterDrawer.vue'
import {
  kName,
  kColumnDefault,
  kColumnWidth,
  kTips
} from '@/v2/cdn_common/views/analysis/query/kname'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getElastic,
  aiWafModel
} = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)
const { getIpArea } = require(`@/v2/${PROCESS_NAME}/api/public`)

export default {
  components: {
    SettingDialog,
    FilterDrawer
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
        hostname: '',
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
      otherQuery: []
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
  },
  mounted() {},
  destroyed() {},
  methods: {
    // 点击生成AI模型
    async toAiWafModel() {
      // 开始时间字符串
      const startStr = this.$dayjs(this.datePicker[0]).format(
        'YYYY-MM-DD HH:mm:ss'
      )
      // 结束时间字符串
      const endStr = this.$dayjs(this.datePicker[1]).format(
        'YYYY-MM-DD HH:mm:ss'
      )
      let success = false
      const result = await this.$confirm('', {
        title: '生成AI模型',
        message: `将根据时间范围：<br/>【${startStr}~${endStr}】<br/>内的数据生成AI模型`,
        type: 'info',
        center: true,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        confirmButtonText: '开始生成',
        confirmButtonLoading: false,
        dangerouslyUseHTMLString: true,
        beforeClose: async (action, instance, done) => {
          console.log(instance)
          if (action === 'confirm') {
            if (success) {
              return done()
            }
            instance.confirmButtonLoading = true
            instance.confirmButtonText = 'AI模型正在生成...'
            instance.showCancelButton = false
            instance.showClose = false

            const { data: res } = await aiWafModel({
              mode: 2,
              // 日期精确到秒，
              startTime: startStr,
              endTime: endStr,
              maxCount: this.total
            })
            if (res.code !== 1) {
              instance.showCancelButton = true
              instance.showClose = true
              instance.confirmButtonLoading = false
              instance.confirmButtonText = '重新生成'
              instance.type = 'error'
              instance.title = 'AI模型生成失败'
              return
            }

            instance.confirmButtonLoading = false
            instance.confirmButtonText = '确定'
            instance.type = 'success'
            instance.title = 'AI模型已生成成功'
            instance.message = `已根据时间范围：<br/>【${startStr}~${endStr}】<br/>内的数据生成AI模型`
            this.$msg.success('生成成功')
            success = true
          } else {
            if (instance.confirmButtonLoading) return
            done()
          }
        }
      }).catch(err => err)
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
          if (isIpv4(source.query_machine)) {
            this.getIpAreaByIp(arr[idx])
          }
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
      const startStr = this.$dayjs(this.datePicker[0]).format(
        'YYYY-MM-DD HH:mm:ss'
      )
      // 结束时间字符串
      const endStr = this.$dayjs(this.datePicker[1]).format(
        'YYYY-MM-DD HH:mm:ss'
      )
      console.log(startStr, endStr)

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
                    gte: startStr,
                    lte: endStr,
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
                    values: this.selectArr.map(item => item.id)
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
        this.selectArr.forEach(item => {
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
