<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索域名',
            key: 'domain',
            value: queryInfo.domain
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="toQuery"
      >
        <template slot="buttons">
          <ants-button
            size="small"
            type="success"
            icon="el-icon-refresh"
            :loading="$root.loading"
            @click="getTableData()"
            text="刷新"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="toPage"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
        class="ants-table-align--top"
      >
        <ants-table-column type="selection" align="center" width="45" />

        <ants-table-column min-width="150" label="主域名" prop="domain">
          <template #default="{ row }">
            <span
              class="text-primary cursor-pointer"
              @click="goDetailPage(row)"
              >{{ row.domain }}</span
            >
            <div></div>
          </template>
        </ants-table-column>
        <ants-table-column min-width="100" label="本月解析量" prop="total">
          <template #default="{ row }">
            {{ row.total || 0 }}
          </template>
        </ants-table-column>
        <ants-table-column
          v-for="item in typeArr"
          :key="item"
          min-width="150"
          :label="`本月${item}记录解析量`"
          :prop="item"
        >
          <template #default="{ row }">
            <div>
              <span class="table-info-span">DES</span>
              <span>{{ (row[item] || {}).sum_des || 0 }}</span>
            </div>
            <div>
              <span class="table-info-span">AES</span>
              <span>{{ (row[item] || {}).sum_aes || 0 }}</span>
            </div>
            <div>
              <span class="table-info-span">HTTPS</span>
              <span>{{ (row[item] || {}).sum_https || 0 }}</span>
            </div>
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <FormDialog ref="FormDialogRef" @refresh="getTableData" />
  </div>
</template>

<script>
// 组件
import FormDialog from './FormDialog.vue'

// 用户平台API，获取用户所有域名
import { getAllDomain } from '@/v2/dns_users/api/dns/domain'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/dns/monitor`)

const typeArr = ['A', 'AAAA', 'ADDRS']

// 获取到的所有的数据，用来做分页
let allData = []

// 用户平台需要，用户的所有域名
let userAllDomainsTerms = []

export default {
  components: {
    FormDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        domain: '',
        user: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],
      selectArr: [],
      typeArr
    }
  },
  created() {
    // 如果为用户平台
    if (PROCESS_NAME === 'dns_users') {
      this.getUserDomainList()
    }

    // 如果为管理员平台
    if (PROCESS_NAME === 'dns_admin') {
      this.getTableData()
    }
  },
  mounted() {},
  methods: {
    // 获取用户所有域名，用户平台需要过滤掉其他域名
    async getUserDomainList() {
      this.$root.loading = true
      userAllDomainsTerms = []
      try {
        const { data: res } = await getAllDomain({
          igg: 0
        })
        this.$root.loading = false
        if (res.code !== 1) return
        userAllDomainsTerms = res.data || []
        // 如果有用户有域名，则查询日志数据
        if (userAllDomainsTerms.length) {
          this.getTableData()
        }
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    // 查询数据
    toQuery() {
      this.queryInfo.page = 1
      this.buildTableData()
    },

    // 查询数据，做本地分页
    toPage() {
      this.buildTableData()
    },

    // 构造表格数据，做本地分页
    buildTableData() {
      const { page, limit } = this.queryInfo
      const buckets = allData.slice((page - 1) * limit, page * limit)

      this.tableData = buckets.map((item) => {
        const sumObj = {
          domain: item.key,
          total: 0,
          A: {},
          AAAA: {},
          HTTPS: {}
        }
        const queryTypeFilter = item.query_type_filter || {}
        const recordBuckets = queryTypeFilter.buckets || []

        recordBuckets.forEach((type) => {
          if (typeArr.indexOf(type.key) === -1) return
          sumObj[type.key] = {
            sum_des: (type.sum_des || {}).value || 0,
            sum_aes: (type.sum_aes || {}).value || 0,
            sum_https: (type.sum_https || {}).value || 0,
            sum_total: (type.sum_total || {}).value || 0
          }
          sumObj.total += sumObj[type.key].sum_total
        })
        return sumObj
      })
    },

    // 获取统计数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { page, limit } = this.queryInfo
        const { data: res } = await getElastic({
          domain: '',
          // 需要做本地分页，所以不需要传递分页参数
          // uri: `/http-dns/_search?size=${limit}&from=${(page - 1) * limit}`,
          uri: 'http-dns/_search',
          postData: JSON.stringify(this.buildQueryData())
        })
        this.$root.loading = false
        if (res.code !== 1) return
        const obj = JSON.parse(res.data)
        console.log(obj)
        const aggregations = obj.aggregations || {}
        allData = (aggregations.domain_filter || {}).buckets || []
        this.total = allData.length
        this.buildTableData()
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    // 构建查询数据
    buildQueryData() {
      // 构造本月的月初至当前时间
      const now = new Date()
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate()
      const monthStart = `${year}-${month}-01 00:00:00`
      const monthEnd = `${year}-${month}-${day} 23:59:59`

      const queryObj = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  timestamp: {
                    gte: monthStart,
                    lte: monthEnd,
                    format: 'yyyy-MM-dd HH:mm:ss',
                    // 时区
                    time_zone: '+08:00'
                  }
                }
              }
              // {
              //   terms: {
              //     'domain.keyword': ['165668.com', 'vedns.com']
              //   }
              // }
            ]
          }
        },
        sort: [
          {
            timestamp: {
              // 降序 = desc, 升序 = asc
              order: 'desc'
            }
          }
        ],
        aggs: {
          domain_filter: {
            terms: {
              field: 'domain.keyword',
              // 用来做分页，先取出汇聚的 1000 条数据，然后本地做分页
              size: 1000
            },
            aggs: {
              query_type_filter: {
                terms: {
                  field: 'query_type.keyword'
                },
                aggs: {
                  sum_total: {
                    sum: {
                      field: 'total'
                    }
                  },
                  sum_aes: {
                    sum: {
                      field: 'aes'
                    }
                  },
                  sum_des: {
                    sum: {
                      field: 'des'
                    }
                  },
                  sum_https: {
                    sum: {
                      field: 'https'
                    }
                  }
                }
              }
            }
          }
        }
      }

      // 如果是用户平台，则只查询用户的域名
      if (PROCESS_NAME === 'dns_users' && userAllDomainsTerms.length) {
        queryObj.query.bool.must.push({
          terms: {
            'domain.keyword': userAllDomainsTerms
          }
        })
      }

      // 搜索框，模糊查询有点问题
      if (this.queryInfo.domain !== '') {
        queryObj.query.bool.must.push({
          wildcard: {
            'domain.keyword': `*${this.queryInfo.domain.trim()}*`
          }
        })
      }

      return queryObj
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 前往添加
    toAdd() {
      this.$refs.FormDialogRef.show()
    },

    // 前往详情
    goDetailPage(row) {
      this.$router.push({
        name: 'HttpdnsDomainDetail',
        query: {
          id: row.id
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.table-info-span {
  display: inline-block;
  width: 80px;
  color: theme('colors.ants-text-5');
}
</style>

<style lang="scss">
.ants-table-align--top {
  .el-table__cell {
    vertical-align: top;
  }
}
</style>
