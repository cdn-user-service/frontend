<template>
  <el-drawer
    :visible.sync="visible"
    direction="rtl"
    append-to-body
    size="800px"
    custom-class="overview-table-drawer"
  >
    <div slot="title" class="font-semibold text-ants-text-1">
      {{ hostData.name }}
    </div>
    <div class="px-lg">
      <el-row :gutter="20">
        <el-col
          :span="8"
          v-for="(item, key) in roseType"
          :key="key"
          v-loading="roseType[key]"
          class="rose-chart-box"
        >
          <RoseChart style="width:80%;" :ref="`RoseChartRef${key}`" />
        </el-col>
      </el-row>

      <ul class="space-y-df pb-lg">
        <li
          v-for="(item, key) in lineType"
          :key="key"
          class="chart-box border border-ants-border-2 rounded-2xl"
          v-loading="item"
        >
          <Chart :ref="`ChartRef${key}`" />
        </li>
      </ul>
    </div>
  </el-drawer>
</template>

<script>
// api
import { getElastic } from '@/v2/dns_admin/api/dns/monitor'
// 组件
import Chart from '../LineChart/Chart.vue'
import RoseChart from '../RoseChart'

// 查询数据
import queryLine from '../LineChart/query-line'
import queryRose from '../LineChart/query-rose'

const lineType = {}
Object.keys(queryLine).forEach(key => {
  lineType[key] = false
})
const roseType = {}
Object.keys(queryRose).forEach(key => {
  roseType[key] = false
})

export default {
  components: {
    Chart,
    RoseChart
  },
  data() {
    return {
      visible: false,
      hostData: {
        // hostName
        name: ''
      },
      query: {
        gte: '1h',
        step: '1m'
      },
      loading: false,
      roseLoading: false,
      lineType: {
        ...lineType
      },
      roseType: {
        ...roseType
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    // 抽屉显示
    show(row = {}, query = {}) {
      this.visible = true
      this.query = query
      this.hostData = {
        ...this.hostData,
        ...row
      }

      this.$nextTick(() => {
        // 折线图数据
        Object.keys(queryLine).forEach(key => {
          this.queryChart(key)
        })

        // 饼图数据
        Object.keys(queryRose).forEach(key => {
          this.queryRoseChart(this.hostData.name, key)
        })
      })
    },

    // 查询统计数据
    async queryChart(type = '') {
      const queryItem = queryLine[type]
      if (!queryItem) return
      const { title, aggs, computed, yAxisMax, yAxisLabel } = queryItem

      this.lineType[type] = true
      try {
        const { data: res } = await getElastic({
          uri: 'metricbeat-*/_search',
          postData: JSON.stringify(
            this.buildQueryData({
              aggs
            })
          )
        })

        // 如果有数据
        const obj = JSON.parse(res.data || '{}')
        const buckets = ((obj.aggregations || {})[0] || {}).buckets || []

        const bucketsObj = {}
        buckets.forEach(item => {
          const hostname = item.key
          bucketsObj[hostname] = (item[1] || {}).buckets || []
        })

        this.$refs[`ChartRef${type}`][0].initChart({
          // 标题
          title,
          // 最大值
          yAxisMax,
          // y轴标签
          yAxisLabel,
          // series数据
          series: computed(bucketsObj[this.hostData.name])
        })
      } finally {
        this.lineType[type] = false
      }
    },

    // 查询饼图数据
    async queryRoseChart(hostname, type) {
      if (!this.$refs[`RoseChartRef${type}`]) return
      // 饼图数据
      const queryRoseItem = queryRose[type] || {}
      if (!queryRoseItem) return
      const { aggs, title, computed, customFormatter } = queryRoseItem

      this.roseType[type] = true
      try {
        const { data: res } = await getElastic({
          uri: 'metricbeat-*/_search',
          postData: JSON.stringify(
            this.buildRoseQueryData({
              aggs,
              hostname
            })
          )
        })
        this.roseType[type] = false

        // 如果有数据
        const obj = JSON.parse(res.data || '{}')
        console.log('roseObj', obj)
        const aggsObj = obj.aggregations || {}

        this.$refs[`RoseChartRef${type}`][0].initChart({
          title,
          customFormatter,
          data: computed(aggsObj)
        })
      } finally {
        this.roseType[type] = false
      }
    },

    // 构造查询数据
    buildQueryData({ aggs, roseAggs = {} }) {
      const { gte, lte, step } = this.query
      const { name } = this.hostData

      return {
        aggs: {
          0: {
            terms: {
              // field: 'host.name.keyword',
              field: 'agent.name',
              order: {
                _key: 'asc'
              },
              size: 1
            },
            aggs: {
              1: {
                date_histogram: {
                  field: '@timestamp',
                  // calendar_interval: '1m',
                  fixed_interval: step,
                  time_zone: 'Asia/Shanghai',
                  min_doc_count: 1
                },
                aggs
              },
              // 饼图数据
              ...roseAggs
            }
          }
        },
        size: 0,
        query: {
          bool: {
            must: [],
            filter: [
              {
                terms: {
                  'agent.name': [
                    name
                    // '192.168.1.110'
                    // 'localhost.localdomain',
                    // 'QLc7etlu3fnrwh'
                  ]
                }
              },
              // {
              //   exists: {
              //     field: 'host.name'
              //   }
              // },
              {
                range: {
                  '@timestamp': {
                    // format: 'strict_date_optional_time',
                    gte: 'now-' + gte,
                    lte: lte ? `now-${lte}` : 'now'
                  }
                }
              }
            ]
          }
        }
      }
    },

    // 构造饼图查询数据
    buildRoseQueryData({ aggs = {}, hostname }) {
      const { gte, lte } = this.query

      return {
        size: 0,
        query: {
          bool: {
            must: [
              {
                match: {
                  'host.hostname': hostname
                }
              }
            ],
            filter: [
              {
                range: {
                  '@timestamp': {
                    // gte: 'now-' + gte,
                    // lte: lte ? `now-${lte}` : 'now',
                    gte: 'now-5m',
                    lte: 'now'
                  }
                }
              }
            ]
          }
        },
        aggs
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-box {
  height: 250px;
  @media screen and (max-width: 768px) {
    height: 200px;
  }
}
.rose-chart-box {
  height: 250px;
  @media screen and (max-width: 768px) {
    height: 200px;
  }
}
</style>

<style lang="scss">
.overview-table-drawer {
  .el-drawer__header {
    margin: 0;
    padding-bottom: 15px;
    padding-top: 15px;
    border-bottom: 1px solid theme('colors.ants-border-2');
  }
}
</style>
