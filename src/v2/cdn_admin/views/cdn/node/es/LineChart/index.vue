<template>
  <el-skeleton :rows="8" :loading="$root.loading" animated>
    <el-empty description="描述文字" v-if="!hostsList.length" />

    <el-row :gutter="20" v-else>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
        v-for="(item, idx) in hostsList"
        :key="item.name"
      >
        <div
          class="chart-box border border-ants-border-2 rounded-2xl mt-lg flex"
        >
          <Chart
            :style="{ width: showRoseChart ? '70%' : '100%' }"
            :ref="`ChartRef${idx}`"
          />

          <RoseChart
            style="width:30%;"
            v-if="showRoseChart"
            :ref="`RoseChartRef${idx}`"
          />
        </div>
      </el-col>
    </el-row>
  </el-skeleton>
</template>

<script>
// api
import { getElastic } from '@/v2/cdn_admin/api/cdn/monitor'
// 组件
import Chart from './Chart.vue'
import RoseChart from '../RoseChart'

// 查询数据
import queryLine from './query-line'
import queryRose from './query-rose'

export default {
  components: {
    Chart,
    RoseChart
  },
  data() {
    return {
      initLoading: true,
      loading: false,
      roseLoading: false,
      hostsList: [],
      showRoseChart: false,
      query: {}
    }
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {
    // 查询统计数据
    async queryChart({ type, gte, lte, step, nodes = [], append = 0 }) {
      if (!nodes.length) {
        this.hostsList = []
        return
      }
      this.hostsList = [...nodes]

      this.query = { type, gte, lte, step, nodes, append }
      this.showRoseChart = ['memory', 'disk', 'cpu'].includes(type)

      const queryItem = queryLine[type]

      if (!queryItem) return

      const { aggs, computed, yAxisMax, yAxisLabel } = queryItem

      this.loading = true
      try {
        const { data: res } = await getElastic({
          uri: 'metricbeat-*/_search',
          postData: JSON.stringify(
            this.buildQueryData({
              aggs,
              type
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

        this.hostsList.forEach((hostname, idx) => {
          this.$nextTick(() => {
            this.$refs[`ChartRef${idx}`][0].initChart({
              // 是否需要清除图表
              clear: append <= 1,
              title: hostname,
              // 最大值
              yAxisMax,
              // y轴标签
              yAxisLabel,
              // series数据
              series: computed(bucketsObj[hostname], step)
            })

            // 查询饼图数据
            this.queryRoseChart(hostname, idx)
          })
        })
      } finally {
        this.loading = false
        this.initLoading = false
      }
    },

    // 查询饼图数据
    async queryRoseChart(hostname, idx) {
      const { type, append } = this.query
      if (!this.showRoseChart) return
      // 饼图数据
      const queryRoseItem = queryRose[type] || {}
      if (!queryRoseItem) return
      const { aggs, title, computed, customFormatter } = queryRoseItem

      this.roseLoading = true
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

        const obj = JSON.parse(res.data || '{}')
        const aggsObj = obj.aggregations || {}

        this.$refs[`RoseChartRef${idx}`][0].initChart({
          // 是否需要清除图表
          clear: append <= 1,
          title,
          customFormatter,
          data: computed(aggsObj)
        })
      } finally {
        this.roseLoading = false
      }
    },

    // 构造查询数据
    buildQueryData({ aggs = {}, type }) {
      const { gte, lte, step, nodes } = this.query

      // 如果为查询 Nginx 的数据
      const nginxQuerys = []
      if (
        [
          'requests',
          'handled',
          'accepts',
          'waiting',
          'active',
          'writing',
          'reading'
        ].includes(type)
      ) {
        nginxQuerys.push({
          match: {
            'event.module': 'nginx'
          }
        })
      }

      return {
        aggs: {
          0: {
            terms: {
              // field: 'host.name.keyword',
              field: 'agent.name',
              order: {
                _key: 'asc'
              },
              size: 200
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
              }
            }
          }
        },
        size: 0,
        query: {
          bool: {
            must: [
              // 查询指定节点
              {
                terms: {
                  'agent.name': nodes
                }
              },
              {
                range: {
                  '@timestamp': {
                    // format: 'strict_date_optional_time',
                    gte: 'now-' + gte,
                    lte: lte ? `now-${lte}` : 'now'
                  }
                }
              },
              ...nginxQuerys
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
  height: 300px;
  @media screen and (max-width: 1192px) {
    height: 200px;
  }
}
</style>
