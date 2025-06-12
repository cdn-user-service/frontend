<template>
  <el-card class="content-box animated fadeIn">
    <div class="flex items-center justify-between">
      <ants-radio-group v-model="time" size="small" @change="getTableData()">
        <ants-radio-button
          v-for="(item, key) in timeObj"
          :key="key"
          :label="key"
          :text="item"
        />
      </ants-radio-group>
      <ants-button
        type="success"
        size="mini"
        icon="el-icon-refresh"
        text="刷新"
        @click="getTableData()"
      />
    </div>

    <el-table :data="tableData" size="small" border v-loading="$root.loading">
      <ants-table-column
        width="120"
        label="排行"
        type="index"
        align="center"
      ></ants-table-column>
      <ants-table-column width="120" label="时长" align="center">
        <template>
          <el-tag size="small" type="primary">
            {{ timeObj[time] }}
          </el-tag>
        </template>
      </ants-table-column>
      <ants-table-column
        min-width="140"
        label="域名"
        prop="domain"
      ></ants-table-column>

      <ants-table-column min-width="120" label="请求数" prop="total">
        <template #default="{ row }"> {{ row.total }} 次 </template>
      </ants-table-column>
    </el-table>
  </el-card>
</template>

<script>
// 用户平台API，获取用户所有域名
import { getAllDomain } from '@/v2/dns_users/api/dns/domain'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/dns/monitor`)

// 用户平台需要，用户的所有域名
let userAllDomainsRegexp = ''

export default {
  data() {
    return {
      domain: '',

      timeObj: {
        '5m': '近5分钟',
        '1h': '近1小时',
        '1d': '近一天'
      },

      tableData: [],
      time: '5m'
    }
  },
  created() {
    if (PROCESS_NAME === 'dns_users') {
      this.getUserDomainList()
    }

    if (PROCESS_NAME === 'dns_admin') {
      this.getTableData()
    }
  },
  methods: {
    // 获取用户所有域名，用户平台需要过滤掉其他域名
    async getUserDomainList() {
      this.$root.loading = true
      userAllDomainsRegexp = ''
      try {
        const { data: res } = await getAllDomain({
          igg: 0
        })
        this.$root.loading = false
        if (res.code !== 1) return
        const domainArr = res.data || []
        // 如果有用户有域名，则查询日志数据
        if (domainArr.length) {
          // userAllDomainsRegexp = domainArr.map((item) => `.*${item}.*`).join('|')
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
      const queryObj = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  timestamp: {
                    gte: 'now-' + this.time,
                    lte: 'now'
                  }
                }
              }
            ]
          }
        },
        aggs: {
          domain: {
            terms: {
              field: 'domain.keyword',
              size: 20
            }
          }
        }
      }

      // 如果是用户平台，则只查询用户的域名
      if (PROCESS_NAME === 'dns_users' && userAllDomainsRegexp != '') {
        queryObj.query.bool.must.push({
          // regexp: {
          //   domain: userAllDomainsRegexp
          // }
          query_string: {
            query: userAllDomainsRegexp,
            default_field: 'domain.keyword',
            analyze_wildcard: true
          }
        })
      }

      const { data: res } = await getElastic({
        domain: '', // 域名不用传
        uri: 'query-log/_search',
        postData: JSON.stringify(queryObj)
      })
      this.$root.loading = false
      if (!res.data) return
      const obj = JSON.parse(res.data)

      const arr = []
      obj.aggregations.domain.buckets.forEach((item) => {
        arr.push({
          domain: item.key,
          total: item.doc_count
        })
      })

      this.tableData = arr
    }
  }
}
</script>
