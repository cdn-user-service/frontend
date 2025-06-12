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
          name: '检索封禁IP',
          key: 'ip',
          value: queryInfo.ip
        },
        domain
          ? null
          : {
              name: '检索封禁域名',
              key: 'server_name',
              value: queryInfo.server_name
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
          :disabled="btnLoading || rleaseLoading"
          @click="toQuery()"
          text="刷新"
          icon="el-icon-refresh"
        />
        <ants-button
          v-if="!$root.disabledCrud"
          size="small"
          type="primary"
          :loading="$root.loading || rleaseLoading"
          :disabled="btnLoading"
          @click="toRleaseAll()"
          text="全部解封"
          icon="el-icon-s-promotion"
        />
        <ants-button
          v-if="!$root.disabledCrud"
          size="small"
          type="info"
          :loading="$root.loading || rleaseLoading"
          :disabled="btnLoading"
          @click="toBatchRlease()"
          text="批量解封"
          icon="el-icon-s-promotion"
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
          style="margin-right: 10px; width: 260px"
        />
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
      <ants-table-column
        type="selection"
        width="45"
        align="center"
        :selectable="selectable"
      />

      <ants-table-column min-width="150" label="时间" prop="timestamp">
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
      <ants-table-column min-width="140" label="域名" prop="server_name">
        <template #default="{ row }">
          <ants-copy :text="row.server_name" inline />
        </template>
      </ants-table-column>

      <ants-table-column min-width="120" label="封禁IP" prop="ip">
        <template #default="{ row }">
          <ants-copy :text="row.ip" inline class="text-error" />
        </template>
      </ants-table-column>

      <ants-table-column
        min-width="200"
        label="区域"
        prop="area"
        show-overflow-tooltip
      >
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

      <ants-table-column min-width="100" label="封禁模式" prop="mode">
        <template #default="{ row }"> {{ modeObj[row.mode] }} </template>
      </ants-table-column>

      <ants-table-column min-width="100" label="封禁时长" prop="param">
        <template #default="{ row }"> {{ row.param }} 分钟 </template>
      </ants-table-column>

      <ants-table-column min-width="100" label="触发规则索引" prop="index">
        <template #default="{ row }">
          {{ `第${row.indexStr}条` }}
        </template>
      </ants-table-column>

      <ants-table-column width="100" label="操作" auto-fixed>
        <template #default="{ row }">
          <span class="text-success" v-if="row.rlease == 1">已解封</span>
          <ants-button
            v-else
            size="mini"
            text="解封"
            type="primary"
            :disabled="btnLoading"
            :loading="rleaseLoading"
            @click="toRlease(row)"
          />
        </template>
      </ants-table-column>
    </ants-table>
  </el-card>
</template>

<script>
import { calendarShortcuts } from '@/utils/shortcuts'

// 验证规则
import { isIpv4 } from '@/utils/validate'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)
const { getIpArea } = require(`@/v2/${PROCESS_NAME}/api/public`)
const { getAllDomain } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)
const { doReleaseIps } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const modeObj = {
  303: '单节点拉黑',
  304: '全节点拉黑',
  401: '请求参数拦截',
  402: '请求体拦截',
  501: '超时拉黑',
  601: 'AI拉黑'
}

export default {
  props: {
    // 查询指定域名
    domain: String
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      modeObj,
      total: 0,
      queryInfo: {
        logType: 'block',
        startDate: '', // 开始日期
        endData: '', // 结束日期
        // 检索节点IP
        hostname: '',
        // 检索封禁IP
        ip: '',
        // 检索域名
        server_name: this.domain || '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      btnLoading: false,
      rleaseLoading: false,

      // 默认查询近一天的数据
      datePicker: [
        new Date().getTime() - 1000 * 3600 * 24,
        new Date().getTime()
      ],
      datePickerOptions: {
        shortcuts: calendarShortcuts,
        firstDayOfWeek: 1
      },

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
    // 用户端需要过滤域名
    if (!this.isAdmin && !this.domain) {
      this.getUserAllDomains()
      return
    }
    this.getTableData()
  },
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

    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { page, limit } = this.queryInfo
        const { data: res } = await getElastic({
          uri: `filebeat-*/_search?size=${limit}&from=${(page - 1) * limit}`,
          postData: JSON.stringify(this.buildQueryData())
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
            // 规则第几条
            indexStr: this.toChinese(source.index),
            // IP 区域
            areaLoading: false,
            area: ''
          })

          // 获取来源IP的地区，只查询IPv4
          if (isIpv4(source.ip)) {
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

    // 根据IP地址获取区域信息
    async getIpAreaByIp(row) {
      row.areaLoading = true
      try {
        const { data: res } = await getIpArea({
          ip: row.ip
        })
        if (res.code !== 1) return
        row.area = res.data
      } finally {
        row.areaLoading = false
      }
    },

    // 构造查询参数
    buildQueryData() {
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

      // 搜索框，模糊查询来源IP
      if (this.queryInfo.ip !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            // 'ip.keyword': {
            //   value: `*${this.queryInfo.ip.trim()}*`
            // },
            ip: {
              value: `*${this.queryInfo.ip.trim()}*`
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

      // 搜索框，模糊查询域名
      if (this.queryInfo.server_name !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            server_name: {
              value: `*${this.queryInfo.server_name.trim().toLowerCase()}*`
            }
          }
          // regexp: {
          //   k_host: `.*${this.queryInfo.k_host.trim().toLowerCase()}.*`
          // }
        })
      }

      // 如果为用户端，需要过滤域名
      if (!this.isAdmin && !this.domain) {
        queryObj.query.bool.must.push({
          terms: {
            server_name: this.userDomains
          }
        })
      }

      return queryObj
    },

    // 数字转中文，个位数，十位数，百位数
    toChinese(idx = 0) {
      const num = +idx + 1
      const arr = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
      const arr2 = ['', '十', '百', '千', '万']
      const str = num + ''
      const len = str.length
      let result = ''
      for (let i = 0; i < len; i++) {
        const char = str[i]
        result += arr[char - 1] + arr2[len - i - 1]
      }
      return result
    },

    // 查询时间
    changeDate(val) {
      this.queryInfo.page = 1
      this.getTableData()
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 解封
    async toRlease(row = {}) {
      const result = await this.$doDelete({
        title: '解封IP',
        content: `确定要解封IP：${row.ip}吗？`,
        name: row.ip
      })
      if (!result) return
      this.btnLoading = true

      try {
        const { data: res } = await doReleaseIps({
          ips: row.ip
        })
        if (res.code !== 1) return
        this.$msg.success(this.antsT('解封成功'))
        // this.getTableData()
        row.rlease = 1
        this.setRleaseFlag({
          ids: [row.id]
        })
      } finally {
        this.btnLoading = false
      }
    },

    // 表格是否可勾选
    selectable(row) {
      return row.rlease != 1
    },

    // 批量解封
    async toBatchRlease() {
      const selectLength = this.selectArr.length
      if (!selectLength) {
        return this.$msg.warning(this.antsT('请选择要解封的IP'))
      }
      const result = await this.$batchDelete(selectLength, {
        title: '批量解封IP',
        content: `此操作将解封${selectLength}个IP，是否继续？`
      })
      if (!result) return
      this.btnLoading = true
      try {
        const ips = this.selectArr.map((item) => item.ip)
        const { data: res } = await doReleaseIps({
          ips: ips + ''
        })
        if (res.code !== 1) return
        // this.getTableData()
        this.selectArr.forEach((item) => {
          item.rlease = 1
        })

        this.setRleaseFlag({
          ids: this.selectArr.map((item) => item.id)
        })
        this.$msg.success(selectLength + '个IP已解封')
        this.selectArr = [] // 释放
        // 清除表格勾选
        this.$refs.AntsTableRef.$children[0].clearSelection()
      } finally {
        this.btnLoading = false
      }
    },

    // 全部解封
    async toRleaseAll() {
      const result = await this.$batchDelete(1, {
        title: '全部解封',
        content: '此操作将全部解封已封禁的IP，是否继续？'
      })
      if (!result) return
      this.btnLoading = true
      try {
        const { data: res } = await doReleaseIps({
          ips: 'all'
        })
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success('操作成功')
        this.setRleaseFlag({
          isAll: true
        })
      } finally {
        this.btnLoading = false
      }
    },

    // 设置解封标识
    async setRleaseFlag({ indexs = [], ids = [], isAll = false }) {
      this.btnLoading = true
      try {
        const postData = {
          query: {},
          script: {
            // 追加 rlease = 1 为已解封
            source: 'ctx._source.rlease = 1',
            lang: 'painless'
          }
        }

        if (isAll) {
          const allQuery = this.buildQueryData()
          postData.query = allQuery.query
        } else {
          postData.query = {
            bool: {
              must: [
                {
                  wildcard: {
                    'log.file.path': {
                      value: '*block.log'
                    }
                  }
                },
                {
                  ids: {
                    values: ids
                  }
                }
              ]
            }
          }
        }

        // 构造索引，多个索引之间用逗号分隔
        const { data: res } = await getElastic({
          uri: '.ds-filebeat-*/_update_by_query',
          method: 'POST',
          postData: JSON.stringify(postData)
        })
        if (res.code !== 1) return
        if (isAll) {
          this.getTableData()
        }
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>
