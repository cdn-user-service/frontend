<template>
  <el-card class="animated fadeIn content-box">
    <ul
      class="menu-wrap flex items-center flex-wrap mb-lg rounded-2xl bg-ants-bg-3 p-3"
    >
      <li
        class="menu-item py-sm px-xl text-center text-sm font-bold text-ants-text-3
         rounded-2xl cursor-color"
        v-for="(item, key) in menuObj"
        :key="key"
        @click="changeMenu(key)"
        :class="{
          'active-menu': topType === key
        }"
      >
        {{ antsT(item) }}
      </li>
    </ul>

    <div class="border border-ants-border-2 rounded-2xl">
      <el-table
        :data="topData"
        size="mini"
        height="calc(100vh - 300px)"
        style="margin-top:6px;"
        v-loading="tableLoading"
      >
        <div slot="empty">
          <el-empty :description="antsT('暂无数据')"> </el-empty>
        </div>
        <ants-table-column type="index" label="#" width="50">
        </ants-table-column>

        <ants-table-column prop="domain" label="域名" min-width="250">
          <template #default="{ row }">
            <ants-copy :text="row.domain" inline />
          </template>
        </ants-table-column>

        <ants-table-column prop="hostname" label="节点" min-width="150">
          <template #default="{ row }">
            <ants-copy :text="row.hostname" inline />
          </template>
        </ants-table-column>

        <ants-table-column prop="request" label="5秒请求数" min-width="120">
        </ants-table-column>

        <ants-table-column prop="flowIn" label="流入" min-width="120">
        </ants-table-column>

        <ants-table-column prop="flowOut" label="流出" min-width="120">
        </ants-table-column>

        <ants-table-column prop="bIn" label="平均流入" min-width="120">
        </ants-table-column>

        <ants-table-column prop="bOut" label="平均流出" min-width="120">
        </ants-table-column>

        <ants-table-column prop="timestamp" label="时间" min-width="150">
          <template #default="{ row }">
            {{ row.timestamp | dateFormat }}
          </template>
        </ants-table-column>

        <ants-table-column label="站点管理" width="100" fixed align="center">
          <template #default="{ row }">
            <span
              @click="toWafRule(row)"
              class="text-primary cursor-pointer px-xs py-1 rounded-lg hover:bg-ants-bg-1"
              :class="{ 'cursor-not-allowed': row.loading }"
            >
              <!-- <i class="el-icon-loading" v-show="row.loading" /> -->
              <i :class="row.loading ? 'el-icon-loading' : 'el-icon-monitor'" />
              管理
            </span>
          </template>
        </ants-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script>
import { bpsUnit, diskUnit } from '@/utils/unit'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getElastic,
  getDomainId
} = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

const menuObj = {
  request: '请求数排行',
  flow: '流量带宽排行'
}

export default {
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      loading: false,
      tableLoading: 0,
      topData: [],
      timer: null,
      menuObj
    }
  },
  computed: {
    topType({ $route }) {
      return $route.query.type === 'flow' ? 'flow' : 'request'
    }
  },
  created() {
    this.tableLoading = true
    this.setTimer()
  },
  mounted() {},
  destroyed() {
    // 清除定时器
    this.clearTimer()
  },
  methods: {
    // 切换类型
    changeMenu(type) {
      this.$router.replace({
        query: {
          type
        }
      })

      this.tableLoading = true
      this.setTimer()
    },

    setTimer() {
      this.clearTimer()
      this.getChart()
      this.timer = setTimeout(this.setTimer, 3 * 1000)
    },

    clearTimer() {
      clearTimeout(this.timer)
    },

    // 查询数据
    async getChart() {
      this.loading = true

      try {
        const { data: res } = await getElastic({
          uri: 'metricbeat-*/_search',
          postData: JSON.stringify(this.buildQueryData())
        })
        if (res.code !== 1) return
        const obj = JSON.parse(res.data || '{}')

        const buckets = ((obj.aggregations || {})[0] || {}).buckets || []
        console.log('buckets', buckets)

        let topArr = []
        buckets.forEach(item => {
          // 节点IP
          const hostname = item.key
          const hits = item.top_document.hits.hits || []
          const source = (hits[0] || {})._source || {}
          const httpWafArr = source.http.waf.v || []

          const newWafArr = httpWafArr.map(item2 => {
            return {
              // 时间
              timestamp: source['@timestamp'],
              // 节点IP
              hostname,
              // 域名
              domain: item2.d,
              // 5s请求数
              request: item2.i1,
              // 流入
              flowIn: diskUnit(item2.i2).label,
              // 流出
              flowOut: diskUnit(item2.i3).label,
              // 平均流入
              bIn: bpsUnit((item2.i2 * 8) / 5).label,
              // 平均流出
              bOut: bpsUnit((item2.i3 * 8) / 5).label,
              bOutVal: item2.i3,
              loading: false
            }
          })
          topArr.push(...newWafArr)
        })

        if (buckets.length) {
          // 手动排序：按照请求数倒序 | 带宽倒序
          const sortKey = this.topType == 'request' ? 'request' : 'bOutVal'
          topArr = topArr.sort((x, y) => {
            return y[sortKey] - x[sortKey]
          })
        }

        this.topData = topArr.slice(0, 99)
      } finally {
        this.loading = false
        this.tableLoading = false
      }
    },

    // 构造查询条件，带宽|流量|请求数
    buildQueryData() {
      const queryData = {
        aggs: {
          0: {
            terms: {
              field: 'agent.name',
              size: 100,
              order: {
                _key: 'desc'
              }
            },
            aggs: {
              top_document: {
                top_hits: {
                  size: 1,
                  sort: [
                    {
                      '@timestamp': {
                        order: 'desc'
                      }
                    }
                  ],
                  _source: ['@timestamp', 'http']
                }
              }
            }
          }
        },
        size: 0,
        query: {
          bool: {
            must: [
              {
                match: {
                  'event.dataset': 'http.waf'
                }
              },
              {
                range: {
                  '@timestamp': {
                    gte: 'now-10s',
                    lte: 'now'
                  }
                }
              }
            ]
          }
        }
      }

      return queryData
    },

    // 点击前往WAF规则
    async toWafRule(row = {}) {
      row.loading = true
      try {
        const { data: res } = await getDomainId({
          name: row.domain
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        this.$router.push({
          path: '/cdn/site/domain/admin/waf',
          query: {
            id: obj.id,
            domain: row.domain
          }
        })
      } finally {
        row.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-item {
  // width: 120px;
}
.menu-item.active-menu {
  background-color: theme('colors.ants-bg-1');
  color: theme('colors.primary');
  box-shadow: 0px 0px 15px 1px rgba(23, 125, 255, 0.1);
}
</style>
