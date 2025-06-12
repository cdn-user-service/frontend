<template>
  <el-skeleton :rows="8" :loading="false" animated>
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
        v-for="(item, idx) in hostsList"
        :key="item.name"
      >
        <!-- v-loading="loading" -->
        <div
          class="chart-box border border-ants-border-2 rounded-2xl mt-lg flex"
        >
          <Chart
            :style="{ width: showRoseChart ? '70%' : '100%' }"
            :ref="`ChartRef${idx}`"
          />
          <!-- v-loading="roseLoading" -->
          <RoseChart
            style="width: 30%"
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
import { getElastic } from '@/v2/dns_admin/api/dns/monitor'
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

      let url = 'metricbeat-*/_search'
      // 如果为QPS
      if (type === 'qps') {
        url = 'package-count/_search'
      }

      const { aggs, computed, yAxisMax, yAxisLabel } = queryItem

      this.loading = true
      try {
        const { data: res } = await getElastic({
          uri: url,
          postData: JSON.stringify(
            this.buildQueryData({
              aggs,
              type
            })
          )
        })

        // 如果有数据
        const obj = res.data || {}
        const buckets = ((obj.aggregations || {})[0] || {}).buckets || []

        const bucketsObj = {}
        buckets.forEach((item) => {
          const hostname = item.key
          bucketsObj[hostname] = (item[1] || {}).buckets || []
        })

        this.hostsList.forEach((hostname, idx) => {
          this.$nextTick(() => {
            console.log('append', append)

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

        // 如果有数据
        const obj = JSON.parse(res.data || '{}')
        console.log('roseObj', obj)
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
      if (type === 'qps') {
        return {
          size: 1,
          query: {
            bool: {
              filter: [
                {
                  terms: {
                    host: nodes
                  }
                },
                {
                  range: {
                    timestamp: {
                      gte: 'now-' + gte,
                      lte: lte ? `now-${lte}` : 'now'
                    }
                  }
                }
              ]
            }
          },

          aggs: {
            0: {
              terms: {
                field: 'host.keyword',
                order: {
                  _key: 'asc'
                },
                size: 20
              },

              aggs: {
                1: {
                  date_histogram: {
                    field: 'timestamp',
                    fixed_interval: step,
                    time_zone: 'Asia/Shanghai',
                    min_doc_count: 1
                  },
                  aggs: {
                    2: {
                      sum: {
                        field: 'total'
                      }
                    }
                  }
                }
              }
            }
          }
        }
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
              size: 20
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
            filter: [
              // 查询指定节点
              {
                terms: {
                  'host.name': nodes
                }
              },
              {
                exists: {
                  field: 'host.name'
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
  height: 300px;
  @media screen and (max-width: 1192px) {
    height: 200px;
  }
}
</style>
