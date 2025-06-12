<template>
  <div>
    <div class="border pl-xl border-ants-border-2 rounded-2xl mb-lg">
      <el-row :gutter="20">
        <el-col :span="8" v-for="(item, key) in upstreamName" :key="key">
          <ul class="my-df">
            <li class="font-semibold">
              {{ antsT(item) }}
            </li>
            <li class="mt-df">
              <div
                class="inline-block total-flow-box"
                v-loading="loading"
                element-loading-spinner="el-icon-loading"
              >
                <span
                  class="text-5xl"
                  :class="key == 'hit' ? 'text-success' : 'text-primary'"
                >
                  <!-- {{ upstream[key] }} -->
                  {{
                    ((upstream[key] / upstreamTotal) * 100 * 100) | priceFormat(' ')
                  }}
                </span>
                <span>%</span>
                <span
                  :class="{
                    'text-success': key == 'hit',
                    'text-primary': key == 'miss',
                    'el-icon-top': upstream[key] / upstreamTotal >= 0.5,
                    'el-icon-bottom': upstream[key] / upstreamTotal < 0.5
                  }"
                  class="mx-1"
                ></span>
              </div>
            </li>
          </ul>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
      >
        <div class="line-chart-box" v-loading="loading">
          <RoseChart
            ref="RoseChartRef"
            :option="{
              legend: {
                left: 20,
                bottom: 20,
                orient: 'vertical'
              }
            }"
          />
        </div>
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 16 }"
        :lg="{ span: 16 }"
        :xl="{ span: 16 }"
      >
        <div class="line-chart-box" v-loading="loading">
          <LineChart ref="LineChartRef" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { numUnit } from '@/utils/unit'
import RoseChart from '../../components/RoseChart'
import LineChart from '../../components/LineChart'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

const upstreaObj = {
  1: '未命中[MISS]',
  2: '绕过[BYPASS]',
  3: '已过期[EXPIRED]',
  4: '已失效[STALE]',
  5: '正在更新[UPDATING]',
  6: '重新验证[REVALIDATED]',
  7: '命中[HIT]',
  8: '稀缺[SCARCE]'
}

export default {
  components: {
    RoseChart,
    LineChart
  },
  data() {
    return {
      loading: false,
      query: {},
      type: 1,
      upstreamName: {
        // 命中
        hit: '命中',
        // 未命中
        miss: '未命中'
      },
      upstream: {
        // 未命中
        miss: 0,
        // 命中
        hit: 0
      }
    }
  },
  computed: {
    // 总数
    upstreamTotal() {
      const { miss = 0, hit = 0 } = this.upstream
      return miss + hit || 1
    }
  },
  methods: {
    getChart(query = {}) {
      console.log('query', query)
      this.query = query
      if (!query.domains.length) return
      this.toQuery()
    },

    // 查询回源状态数据
    async toQuery() {
      this.loading = true
      try {
        const { data: res } = await getElastic({
          uri: 'filebeat-*/_search',
          postData: JSON.stringify(this.buildQueryData())
        })

        const obj = JSON.parse(res.data || '{}')
        console.log(obj)
        if (!obj) return
        // 如果有数据
        const buckets = ((obj.aggregations || {})[0] || {}).buckets || []
        // 如果有数据
        if (buckets.length) {
          const bucketObj = buckets[0] || {}
          const timeData = bucketObj.total.buckets || []
          console.log('timeData', timeData)

          timeData.forEach(item => {
            // 命中
            if (item.key == '7') {
              this.upstream.hit = item.doc_count || 0
            }
            // 未命中
            if (item.key == '1') {
              this.upstream.miss = item.doc_count || 0
            }
          })
          // 排序
          this.renderRoseChart()
          this.renderLineChart(bucketObj.line.buckets)
        } else {
          this.upstream.hit = 0
          this.upstream.miss = 0
          this.renderRoseChart()
          this.renderLineChart()
        }
      } finally {
        this.loading = false
      }
    },

    // 渲染饼图
    renderRoseChart() {
      const { hit, miss } = this.upstream
      const total = hit + miss
      this.$refs.RoseChartRef.initChart({
        title: '回源命中占比',
        series: [
          {
            name: '回源命中占比',
            data: [
              {
                name: '未命中',
                value: miss,
                label: `${miss} 次`,
                total: `${total} 次`
              },
              {
                name: '命中',
                value: hit,
                label: `${hit} 次`,
                total: `${total} 次`
              }
            ]
          }
        ]
      })
    },

    // 渲染折线图
    renderLineChart(data = []) {
      const obj = {
        miss: {
          name: '未命中',
          data: []
        },
        hit: {
          name: '命中',
          data: []
        }
      }
      data.forEach(item => {
        const time = item.key
        // 未命中
        const missValue = item.miss.doc_count || 0
        const hitValue = item.hit.doc_count || 0
        obj.miss.data.push([time, missValue, `${missValue}次`])
        obj.hit.data.push([time, hitValue, `${hitValue}次`])
      })

      if (!data.length) {
        const time = new Date().getTime()
        obj.miss.data.push([time, 0, `${0}次`])
        obj.hit.data.push([time, 0, `${0}次`])
      }
      const series = []
      Object.keys(obj).forEach(key => {
        series.push(obj[key])
      })
      this.$refs.LineChartRef.initChart({
        // 标题
        title: '回源命中率趋势',
        // 最大值
        yAxisMax: null,
        // y轴标签
        yAxisLabel: value => {
          const { label } = numUnit(value)
          return label
        },
        // series数据
        series
      })
    },

    // 构造查询数据
    buildQueryData() {
      const queryData = {
        aggs: {
          0: {
            terms: {
              // field: 'k_host.keyword',
              field: 'k_host',
              order: {
                _key: 'asc'
              },
              size: 20
            },
            aggs: {
              total: {
                terms: {
                  field: 'l_upstream_status',
                  size: 100
                }
              },
              line: {
                date_histogram: {
                  field: '@timestamp',
                  fixed_interval: this.query.step,
                  time_zone: 'Asia/Shanghai',
                  min_doc_count: 1
                },
                aggs: {
                  // 聚合 l_upstream_status 为 7 的数据
                  hit: {
                    filter: {
                      term: {
                        l_upstream_status: 7
                      }
                    }
                  },
                  miss: {
                    filter: {
                      term: {
                        l_upstream_status: 1
                      }
                    }
                  }
                }
              }
            }
          }
        },
        size: 0,
        query: this.queryTime()
      }
      return queryData
    },

    // 查询时间范围和条件
    queryTime() {
      const { gte, lte, step, domains = [] } = this.query
      return {
        bool: {
          must: [
            // 查询指定域名
            {
              terms: {
                // k_host: ['www.vedns.com']
                k_host: domains
              }
            },
            {
              wildcard: {
                'log.file.path': {
                  value: '*access*'
                }
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
  }
}
</script>
