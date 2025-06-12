<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="
          hiddenDomainInput
            ? [
                {
                  name: '检索来源IP',
                  key: 'source_addr',
                  value: queryInfo.source_addr
                },
                {
                  name: '检索Answer',
                  key: 'answer',
                  value: queryInfo.answer
                }
              ]
            : [
                {
                  name: '检索域名',
                  key: 'domain',
                  value: queryInfo.domain
                },
                {
                  name: '检索来源IP',
                  key: 'source_addr',
                  value: queryInfo.source_addr
                },
                {
                  name: '检索Answer',
                  key: 'answer',
                  value: queryInfo.answer
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
            icon="el-icon-refresh"
            :loading="$root.loading"
            :disabled="btnLoading"
            @click="getTableData()"
            text="刷新"
          />
          <ants-button
            size="small"
            type="info"
            icon="el-icon-download"
            :loading="btnLoading"
            :disabled="$root.loading"
            @click="downloadBulk()"
            text="批量下载"
          />
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-download"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="downloadAll()"
            text="全部下载"
          />
        </template>
        <template slot="inputs">
          <TypeSelect
            v-model="queryInfo.query_type"
            style="width: 120px; margin-right: 10px"
            placeholder="查询记录"
            @change="toQuery"
            clearable
          />
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
            @change="toQuery"
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
      >
        <ants-table-column type="selection" width="45" align="center" />
        <!-- <ants-table-column
          width="180"
          label="ID"
          prop="id"
        ></ants-table-column> -->
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

        <ants-table-column width="120" label="线路" prop="line_code">
          <template #default="{ row }">
            <div
              v-loading="row.sourceLineLoading"
              element-loading-spinner="el-icon-loading"
            >
              <div>
                {{ row.line_code }}
              </div>
              <div>
                {{ row.line_code_area }}
              </div>
            </div>
          </template>
        </ants-table-column>

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

        <ants-table-column min-width="140" label="来源IP" prop="source_addr">
          <template #default="{ row }">
            <div
              v-loading="row.sourceAddrLoading"
              element-loading-spinner="el-icon-loading"
            >
              <div>
                {{ row.source_addr }}
              </div>
              <div>
                {{ row.source_addr_area || '-' }}
              </div>
            </div>
          </template>
        </ants-table-column>
        <ants-table-column width="350" label="Answer" prop="answer">
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
import { exportXLSX } from '@/utils/download'
import { calendarShortcuts } from '@/utils/shortcuts'

// 用户平台API，获取用户所有域名
import { getAllDomain } from '@/v2/dns_users/api/dns/domain'

// 验证规则
import { isIpv4 } from '@/utils/validate'
import TypeSelect from '../../domain-admin/record/TypeSelect'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/dns/monitor`)
const { getIpArea, getCodeArea } = require(`@/v2/${PROCESS_NAME}/api/public`)

// 用户平台需要，用户的所有域名
let userAllDomainsRegexp = ''
let userDomains = []
export default {
  components: {
    TypeSelect
  },
  props: {
    // 是否需要显示检索域名输入框
    hiddenDomainInput: Boolean
  },
  data() {
    return {
      total: 0,
      domain: '',
      queryInfo: {
        startDate: '', // 开始日期
        endData: '', // 结束日期
        domain: '',
        source_addr: '',
        // 检索记录类型
        query_type: '',
        answer: '',
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
    userAllDomainsRegexp = ''
    userDomains = []
    // 需要检索域名的页面
    if (!this.hiddenDomainInput) {
      if (PROCESS_NAME === 'dns_users') {
        this.getUserDomainList()
      }

      if (PROCESS_NAME === 'dns_admin') {
        this.getTableData()
      }
    }
  },
  mounted() {},
  methods: {
    // 获取用户所有域名，用户平台需要过滤掉其他域名
    async getUserDomainList() {
      this.$root.loading = true
      userAllDomainsRegexp = ''
      userDomains = []
      try {
        const { data: res } = await getAllDomain({
          igg: 0
        })
        this.$root.loading = false
        if (res.code !== 1) return
        const domainArr = res.data || []
        // 如果有用户有域名，则查询日志数据
        if (domainArr.length) {
          userDomains = domainArr
          // userAllDomainsRegexp = domainArr.map(item => `.*${item}.*`).join('|')
          userAllDomainsRegexp = domainArr
            .map((item) => `*${item}*`)
            .join(' OR ')
          this.getTableData()
        }
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      const { page, limit } = this.queryInfo
      const { data: res } = await getElastic({
        // 不用传域名
        domain: '',
        uri: `query-log/_search?size=${limit}&from=${(page - 1) * limit}`,
        postData: JSON.stringify(this.buildQueryObj())
      })
      this.$root.loading = false
      if (!res.data) return

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
          // 线路
          line_code: source.line_code,
          line_code_area: '',
          // 请求源
          query_machine: source.query_machine,
          // 节点IP
          host: source.host,
          // 来源IP
          source_addr: source.source_addr,
          answer: source.answer,
          source_addr_area: '',
          sourceAddrLoading: false,
          sourceLineLoading: false
        })

        // 获取线路的地区，code为 default 时不查询
        if (['default', '默认'].indexOf(source.line_code) === -1) {
          this.getCodeAreaByCode(arr[idx])
        }

        // 获取来源IP的地区，只查询IPv4
        if (isIpv4(source.source_addr)) {
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
            ],
            filter: [],
            should: []
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

      const {
        domain,
        source_addr: sourceAddr,
        query_type: queryType,
        answer
      } = this.queryInfo

      // 检索，模糊查询日志信息
      if (answer !== '') {
        queryObj.query.bool.must.push({
          match_phrase: {
            answer: answer.trim()
          }
          // wildcard: {
          //   'answer.keyword': {
          //     value: `*${answer.trim()}*`
          //   }
          // }
        })
      }

      // 搜索框，模糊查询域名
      if (domain !== '') {
        queryObj.query.bool.must.push({
          // regexp: {
          //   domain: `.*${this.queryInfo.domain.trim().toLowerCase()}.*`
          // }
          wildcard: {
            'domain.keyword': {
              value: `*${domain.trim().toLowerCase()}*`
            }
          }
          // query_string: {
          //   default_field: 'domain',
          //   query: `*${domain.trim()}*`,
          //   default_operator: 'OR'
          // }
        })
      }

      // 搜索框，模糊查询来源IP
      if (sourceAddr !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            'source_addr.keyword': {
              value: `*${sourceAddr.trim()}*`
            }
          }
        })
      }

      // 查询记录
      if (queryType !== '') {
        queryObj.query.bool.must.push({
          match: {
            query_type: queryType
          }
        })
      }

      // regexp正则匹配效率过低，数据多了会处理不过来， 如果是用户平台，则只查询用户的域名
      if (PROCESS_NAME === 'dns_users' && userDomains.length) {
        // userDomains.forEach(item => {
        //   queryObj.query.bool.should.push({
        //     wildcard: {
        //       'domain.keyword': {
        //         value: `*${item}*`
        //       }
        //     }
        //   })
        // })
        queryObj.query.bool.must.push({
          // regexp: {
          //   domain: {
          //     value: userAllDomainsRegexp,
          //     flags: 'ALL',
          //     // 表示不区分大小写
          //     case_insensitive: true
          //   }
          // },
          query_string: {
            default_field: 'domain.keyword',
            query: userAllDomainsRegexp,
            analyze_wildcard: true
          }

          // match: {
          //   domain: {
          //     query: '*165668.com*'
          //     // operator: 'and'

          //   }
          // },
        })
      }

      return queryObj
    },

    // 根据IP地址获取区域信息
    async getIpAreaByIp(row) {
      row.sourceAddrLoading = true
      try {
        const { data: res } = await getIpArea({
          ip: row.source_addr
        })
        row.sourceAddrLoading = false
        if (res.code !== 1) return
        row.source_addr_area = res.data
      } catch (error) {
        row.sourceAddrLoading = false
        throw error
      }
    },

    // 根据线路code获取区域信息
    async getCodeAreaByCode(row) {
      row.sourceLineLoading = true
      try {
        const { data: res } = await getCodeArea({
          code: row.line_code
        })
        row.sourceLineLoading = false
        if (res.code !== 1) return
        row.line_code_area = res.data
      } catch (error) {
        row.sourceLineLoading = false
        throw error
      }
    },

    // 查询时间
    toQuery(val) {
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 全部下载
    async downloadAll() {
      this.btnLoading = true
      const queryObj = this.buildQueryObj()
      const { data: res } = await getElastic({
        // 不用传域名
        domain: '',
        uri: 'query-log/_search?size=10000',
        postData: JSON.stringify(queryObj)
      })
      if (res.code !== 1 || !res.data) {
        this.btnLoading = false
        return
      }
      if (!res.data) {
        this.$msg.error('未查询到数据')
        this.btnLoading = false
        return
      }

      const obj = JSON.parse(res.data)
      const arr = []
      obj.hits.hits.forEach((item) => {
        const source = item._source || {}
        arr.push({
          id: item._id,
          // 时间
          timestamp: source.timestamp,
          // 域名
          domain: source.domain,
          // 记录类型
          query_type: source.query_type,
          // 线路
          line_code: source.line_code,
          // EDNS
          query_machine: source.query_machine,
          // 节点IP
          host: source.host,
          // 来源IP
          source_addr: source.source_addr,
          answer: source.answer
        })
      })
      this.downloadLog(arr)
    },

    // 批量下载
    async downloadBulk() {
      if (!this.selectArr.length) {
        return this.$msg.warning('请勾选要下载的数据')
      }

      this.btnLoading = true
      const arr = this.selectArr.map((item) => {
        return {
          id: item.id,
          timestamp: item.timestamp,
          domain: item.domain,
          query_type: item.query_type,
          line_code: `${item.line_code}[${item.line_code_area || '-'}]`,
          query_machine: item.query_machine,
          host: item.host,
          source_addr: `${item.source_addr}[${item.source_addr_area || '-'}]`,
          answer: item.answer
        }
      })
      this.downloadLog(arr)
    },

    // 开始下载日志
    downloadLog(arr = []) {
      // 追加表头
      arr.unshift({
        id: 'ID',
        timestamp: '时间',
        domain: '域名',
        query_type: '记录类型',
        line_code: '线路',
        query_machine: '请求源',
        host: '节点IP',
        source_addr: '来源IP',
        answer: 'Answer'
      })

      // 开始时间字符串
      const startStr = this.$dayjs(this.datePicker[0]).format('YYYY-MM-DD')
      // 结束时间要往后加一天
      const endStr = this.$dayjs(this.datePicker[1]).format('YYYY-MM-DD')
      const name = `${startStr}至${endStr} DNS日志`

      exportXLSX(arr, name)
        .then((data) => {
          setTimeout(() => {
            this.$msg.success('操作成功')
            this.btnLoading = false
          }, 1000)
        })
        .catch((error) => {
          console.log(error)
          this.btnLoading = false
        })
    },

    handleSelectionChange(val) {
      this.selectArr = val
    }
  }
}
</script>
