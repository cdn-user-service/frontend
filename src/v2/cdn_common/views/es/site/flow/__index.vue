<template>
  <div class="animated fadeIn">
    <div class="my-lg rounded-2xl px-lg border border-ants-border-2">
      <el-row :gutter="20">
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 8 }"
          :md="{ span: 8 }"
          :lg="{ span: 8 }"
          :xl="{ span: 8 }"
          v-for="(item, key) in totalData"
          :key="key"
        >
          <ul class="space-y-8 my-df">
            <li class="font-bold">{{ antsT(item.title) }}</li>
            <li>
              <div
                class="inline-block total-flow-box"
                v-loading="loading"
                element-loading-spinner="el-icon-loading"
              >
                <span class="text-5xl">{{ item.value }} </span>
                <span> {{ antsT(item.unit) }}</span>
              </div>
            </li>

            <li class="text-sm text-ants-text-4">{{ item.time }}</li>
          </ul>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" v-for="(_, key) in titleObj" :key="key" class="my-lg">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 24 }"
        :xl="{ span: 24 }"
      >
        <div class="line-chart-box" v-loading="loading">
          <LineChart :ref="`LineChartRef${key}`" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// 组件
import LineChart from '../../components/LineChart'
import queryObj from './query'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

const titleObj = {
  bandwidth: '带宽',
  flow: '流量',
  request: '请求数'
}

export default {
  components: {
    LineChart
  },
  props: {
    // 直接查询域名，用于站点管理里面
    domain: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      titleObj,

      // 总请求数、总流量、峰值带宽
      totalData: {
        bandwidth: {
          title: '峰值带宽',
          value: '0.00',
          unit: 'Bbps',
          time: '~'
        },
        flow: {
          title: '总流量',
          value: '0.00',
          unit: 'B',
          time: '~'
        },
        request: {
          title: '总请求数',
          value: '0',
          unit: '次',
          time: '~'
        }
      },

      // 排行榜
      topData: {
        bandwidth: [],
        flow: [],
        request: []
      },

      // 查询数据
      query: {}
    }
  },
  methods: {
    getChart({ gte, lte, step, domains = [], area = 'china' }) {
      this.query = {
        gte,
        lte,
        step,
        domains,
        area
      }

      if (!domains.length) {
        for (const key in titleObj) {
          const { computed } = queryObj[key]
          this.renderChart(key, computed([]))
        }
        return this.$msg.info('请选择域名')
      }

      this.toQuery()
    },

    // 查询流量、带宽
    async toQuery() {
      this.loading = true
      try {
        const { data: res } = await getElastic({
          uri: 'server_io_p/_search',
          postData: JSON.stringify(this.buildQueryData())
        })
        if (!res.data) return

        const obj = JSON.parse(res.data || '{}')
        console.log('toQuery', obj)

        // terms 聚合查询多条
        // const _buckets = (((obj.aggregations || {})[0] || {})[1] || {}).buckets || []

        // filter 聚合查询单条，速度更快
        const buckets =
          ((((obj.aggregations || {})[0] || {})[1] || {})[2] || {}).buckets ||
          []

        // let timeData = []
        // if (buckets.length) {
        //   timeData = ((buckets[0] || {})[2] || {}).buckets || []
        // }

        console.log('timeData', buckets)

        for (const key in titleObj) {
          const { computed } = queryObj[key]
          const seriesData = computed(buckets, this.query.step)

          // 总流量、峰值带宽、总请求数
          const { val, unit } = seriesData[0].total || {}
          this.totalData[key].value = val
          this.totalData[key].unit = unit

          // 渲染图表
          this.renderChart(key, seriesData)
        }
      } finally {
        this.loading = false
      }
    },

    // 渲染图表
    renderChart(type = 'flow', series = []) {
      const { title, yAxisLabel } = queryObj[type]
      this.$nextTick(() => {
        this.$refs[`LineChartRef${type}`][0].initChart({
          // 标题
          title,
          // 最大值
          yAxisMax: null,
          // y轴标签
          yAxisLabel,
          // series数据
          series
        })
      })
    },

    buildQueryData() {
      const { gte, lte, step, domains = [] } = this.query
      const [domain] = domains
      // const domain = 'www.vedns.com'

      const queryData = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  timestamp: {
                    gte: 'now-' + gte,
                    lte: lte ? `now-${lte}` : 'now'
                  }
                }
              },
              // nested嵌套查询必须要加上，不然查询速度会很慢
              {
                nested: {
                  path: 'v',
                  query: {
                    match: {
                      'v.s': domain
                    }
                  },
                  inner_hits: {} // 在Nested查询中添加inner_hits，以便返回匹配的nested成员
                }
              }
            ]
          }
        },
        aggs: {
          0: {
            nested: {
              path: 'v'
            },
            aggs: {
              1: {
                // 查询单个域名，速度会更快一点
                filter: {
                  match: {
                    'v.s': domain
                  }
                },
                // 可以查询多个域名，速度会慢一些
                // terms: {
                //   field: 'v.s',
                //   include: domain,
                //   size: 1
                // },
                aggs: {
                  2: {
                    date_histogram: {
                      field: 'v.timestamp',
                      fixed_interval: step,
                      time_zone: 'Asia/Shanghai',
                      min_doc_count: 1
                    },
                    aggs: {
                      // 流入
                      'flow-in': {
                        sum: {
                          field: 'v.i'
                        }
                      },
                      // 流出
                      'flow-out': {
                        sum: {
                          field: 'v.o'
                        }
                      },
                      // 请求数
                      'request-count': {
                        sum: {
                          field: 'v.r'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return queryData
    }
  }
}
</script>
