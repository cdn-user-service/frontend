<template>
  <el-card class="mb-lg">
    <div class="flex items-center justify-between">
      <el-radio-group
        v-model="query.gte"
        size="small"
        @change="changeTime"
        :disabled="loading"
      >
        <ants-radio-button
          v-for="(item, key) in timeRange"
          :key="key"
          :label="key"
          :text="item.name"
        />
      </el-radio-group>

      <span
        class="refresh-span cursor-color inline-block rounded-xl p-xs bg-ants-bg-3 el-icon-refresh text-2xl text-ants-text-4"
        @click="getChart"
      >
      </span>
    </div>

    <div class="my-lg">
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
          <div class="rounded-2xl bg-ants-bg-2 pl-lg py-df">
            <ul class="space-y-6">
              <li class="font-bold">{{ antsT(item.title) }}</li>
              <li>
                <div
                  class="inline-block total-flow-box"
                  v-loading="totalLoading"
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(0, 0, 0, 0)"
                >
                  <span class="text-3xl">{{ item.value }} </span>
                  <span> {{ antsT(item.unit) }}</span>
                </div>
              </li>

              <li class="text-sm text-ants-text-4">{{ item.time }}</li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="flex items-center justify-between mb-lg">
      <ants-radio-group
        v-model="query.type"
        size="small"
        @change="changeType"
        :disabled="loading"
      >
        <ants-radio-button
          v-for="(item, key) in titleObj"
          :key="key"
          :label="key"
          :text="item"
        />
      </ants-radio-group>
      <span
        class="text-primary cursor-pointer text-sm"
        @click="$router.push('/cdn/site/es/flow')"
        >{{ antsT('查看详情') }}</span
      >
    </div>

    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 16 }"
        :lg="{ span: 16 }"
        :xl="{ span: 16 }"
      >
        <div
          class="line-chart-box"
          v-loading="loading"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0)"
        >
          <LineChart ref="LineChartRef" />
        </div>
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
      >
        <TopTable ref="TopTableRef" />
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
// 组件
import LineChart from '@/v2/cdn_common/views/es/components/LineChart'
import TopTable from './TopTable.vue'
import { diskUnit } from '@/utils/unit'
import queryObj from './query'

// API
import { getAllDomain } from '@/v2/cdn_users/api/cdn/site'
import { getElastic } from '@/v2/cdn_users/api/cdn/monitor'

const timeRange = {
  '1h': {
    name: '近1小时',
    value: 3600,
    step: '1m'
  },
  // '6h': {
  //   name: '近6小时',
  //   value: 3600 * 6,
  //   step: '5m'
  // },
  '24h': {
    name: '近24小时',
    value: 3600 * 24,
    step: '5m'
  },
  '7d': {
    name: '近7天',
    value: 3600 * 24 * 7,
    step: '1h'
  // },
  // '30d': {
  //   label: '近30天',
  //   step: '24h',
  //   stepVal: 60 * 60 * 24,
  //   unit: '天'
  }
}

const titleObj = {
  flow: '流量',
  bandwidth: '带宽',
  request: '请求数'
}

const lineData = {
  flow: [],
  bandwidth: [],
  request: []
}

export default {
  components: {
    LineChart,
    TopTable
  },
  data() {
    return {
      loading: false,
      totalLoading: false,
      titleObj,
      timeRange,
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
      query: {
        timeValue: 3600,
        // 开启时间
        gte: '1h',
        // 结束时间
        // lte: null,
        // 粒度
        step: '1m',
        // 域名
        domains: [],
        // 区域
        area: 'china',
        type: 'flow'
      }
    }
  },
  created() {
    this.getUserAllDomains()
  },
  mounted() {},
  destroyed() {},
  methods: {
    // 获取用户所有的域名
    async getUserAllDomains() {
      this.loading = true
      try {
        const { data: res } = await getAllDomain({
          igg: 0
        })
        if (res.code !== 1 || !res.data) {
          this.loading = false
          this.renderChart()
          return
        }
        // 获取到的数据为一个对象，key为ID，value为域名，需要转换成数组
        const obj = res.data || {}
        const arr = []
        for (const key in obj) {
          arr.push(obj[key])
        }

        this.query.domains = arr
        this.getChart()
      } catch (error) {
        console.log(error)
        this.loading = false
      }
    },

    // 切换类型
    changeType(type) {
      this.renderChart(type)
      this.$refs.TopTableRef.getTableData(this.query)
    },

    // 切换时间范围
    changeTime(gte) {
      const { step, value } = timeRange[gte]
      this.query.step = step
      this.query.timeValue = value
      this.getChart()
    },

    // 查询数据
    getChart() {
      this.$nextTick(() => {
        this.$refs.TopTableRef.getTableData(this.query)
      })

      console.log('query', this.query)
      if (!this.query.domains.length) {
        // 渲染空数据
        this.renderChart(this.query.type)
        return
      }

      this.queryTotal()
      this.toQuery()
    },

    // 查询数据
    async toQuery() {
      this.loading = true
      const arr = ['flow', 'request']
      arr.forEach(async (item) => {
        const { aggs, computed } = queryObj[item]
        const { type, step } = this.query
        try {
          const { data: res } = await getElastic({
            uri: 'filebeat-*/_search',
            postData: JSON.stringify(this.buildQueryData(aggs))
          })
          const obj = JSON.parse(res.data || '{}')
          if (!obj) return
          const buckets =
            (((obj.aggregations || {})[0] || {})[1] || {}).buckets || []
          console.log('buckets---', buckets)

          lineData[item] = computed(buckets)
          // 设置带宽趋势
          if (item === 'flow') {
            lineData.bandwidth = queryObj.bandwidth.computed(buckets, step)
            // 设置峰值带宽
            const { val, unit } = lineData.bandwidth[1].total
            this.totalData.bandwidth.value = val
            this.totalData.bandwidth.unit = unit
          }

          // 渲染图表
          if (type === item) {
            this.renderChart(item)
          }
          if (type === 'bandwidth') {
            this.renderChart('bandwidth')
          }
        } finally {
          this.loading = false
        }
      })
    },

    // 渲染图表
    renderChart(type = 'flow') {
      const { title, yAxisLabel, computed } = queryObj[type]
      this.$nextTick(() => {
        this.$refs.LineChartRef.initChart({
          // 标题
          title,
          // 最大值
          yAxisMax: null,
          // y轴标签
          yAxisLabel,
          // series数据
          series: lineData[type].length ? lineData[type] : computed([])
        })
      })
    },

    // 查询总请求数、总流量、峰值带宽
    async queryTotal() {
      this.totalLoading = true
      try {
        const { data: res } = await getElastic({
          uri: 'filebeat-*/_search',
          postData: JSON.stringify({
            aggs: {
              0: {
                terms: {
                  field: 'k_host',
                  order: {
                    _key: 'asc'
                  },
                  size: 10000
                },
                aggs: {
                  // 总流量
                  'in-min': {
                    min: {
                      field: 'l_server_in_byte'
                    }
                  },
                  'in-max': {
                    max: {
                      field: 'l_server_in_byte'
                    }
                  },
                  'out-min': {
                    min: {
                      field: 'l_server_out_byte'
                    }
                  },
                  'out-max': {
                    max: {
                      field: 'l_server_out_byte'
                    }
                  },
                  'flow-total': {
                    bucket_script: {
                      buckets_path: {
                        maxInValue: 'in-max',
                        minInValue: 'in-min',
                        maxOutValue: 'out-max',
                        minOutValue: 'out-min'
                      },
                      script:
                        '(params.maxInValue - params.minInValue) + (params.maxOutValue - params.minOutValue)'
                    }
                  },

                  // 请求数
                  'request-min': {
                    min: {
                      field: 'k_server_sum'
                    }
                  },
                  'request-max': {
                    max: {
                      field: 'k_server_sum'
                    }
                  },
                  'request-total': {
                    bucket_script: {
                      buckets_path: {
                        maxRequestValue: 'request-max',
                        minRequestValue: 'request-min'
                      },
                      script: 'params.maxRequestValue - params.minRequestValue'
                    }
                  }
                }
              }
            },
            size: 0,
            query: this.queryTime()
          })
        })
        const obj = JSON.parse(res.data || '{}')
        console.log('total', obj)
        if (!obj) return
        // 如果有数据
        const buckets = ((obj.aggregations || {})[0] || {}).buckets || []
        let totalFlow = 0
        let totalRequest = 0
        buckets.forEach((item) => {
          // 总请求数
          totalRequest += item['request-total'].value || 0
          // 总流量
          totalFlow += item['flow-total'].value || 0
        })
        this.totalData.request.value = totalRequest
        // 总流量
        const { val: flowVal, unit: flowUnit } = diskUnit(totalFlow)
        this.totalData.flow.value = flowVal
        this.totalData.flow.unit = flowUnit
      } finally {
        this.totalLoading = false
      }
    },

    // 构造查询数据
    buildQueryData(aggs = {}) {
      const { step, domains } = this.query
      const queryData = {
        aggs: {
          // 将 'www.vedns.com', 'cdntest2.91hu.top' 聚合到一起
          0: {
            filter: {
              terms: {
                k_host: domains
              }
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
        query: this.queryTime()
      }
      return queryData
    },

    // 查询时间范围和条件
    queryTime() {
      const { gte, lte, domains = [] } = this.query
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
                  lte: 'now'
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

<style lang="scss" scoped>
.line-chart-box {
  height: 320px;
  display: flex;
  border: 1px solid theme('colors.ants-border-2');
  border-radius: theme('borderRadius.2xl');

  @media screen and (max-width: 991px) {
    height: 250px;
  }

  @media screen and (max-width: 767px) {
    height: 220px;
  }
}
</style>
