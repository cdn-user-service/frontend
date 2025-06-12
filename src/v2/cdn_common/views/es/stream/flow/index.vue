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

    <el-row
      :gutter="20"
      v-for="(item, key) in titleObj"
      :key="key"
      class="my-lg"
    >
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 16 }"
        :md="{ span: 18 }"
        :lg="{ span: 18 }"
        :xl="{ span: 18 }"
      >
        <div class="line-chart-box" v-loading="lineLoading">
          <LineChart :ref="`LineChartRef${key}`" />
        </div>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 8 }"
        :md="{ span: 6 }"
        :lg="{ span: 6 }"
        :xl="{ span: 6 }"
      >
        <TitleBorder :title="`${item} Top10`" />
        <el-table
          size="mini"
          v-loading="topLoading"
          :data="topData[key]"
          max-height="260"
        >
          <el-table-column
            label="#"
            type="index"
            min-width="50"
          ></el-table-column>
          <el-table-column label="端口" min-width="100" prop="port" />
          <el-table-column :label="item" min-width="100" prop="value">
            <template #default="{ row }">
              {{ row[key] }}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// 组件
import LineChart from '../../components/LineChart'
import { networkUnit, diskUnit, numUnit, bpsUnit } from '@/utils/unit'
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
  data() {
    return {
      loading: false,
      lineLoading: false,
      topLoading: false,
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
    getChart({ gte, lte, step, streams = [], timeValue }) {
      this.query = {
        gte,
        lte,
        step,
        timeValue,
        streams: streams.map(it => it + '')
      }
      console.log('query', this.query)
      if (!streams.length) {
        for (const key in titleObj) {
          const { computed } = queryObj[key]
          this.renderChart(key, computed([]))
        }
        return this.$msg.info('请选择端口')
      }

      this.queryTotal()
      this.toQuery()
      this.queryTopData()
    },

    // 查询数据
    async toQuery() {
      this.lineLoading = true
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

        let timeData = []
        if (buckets.length) {
          const bucketObj = buckets[0] || {}
          timeData = bucketObj[1].buckets || []
        }

        for (const key in titleObj) {
          const { computed } = queryObj[key]
          const seriesData = computed(timeData, this.query.step)
          // 峰值带宽
          if (key === 'bandwidth') {
            const { val, unit } = seriesData[1].total
            this.totalData.bandwidth.value = val
            this.totalData.bandwidth.unit = unit
          }
          this.renderChart(key, seriesData)
        }
      } finally {
        this.lineLoading = false
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

    // 查询总请求数、总流量、峰值带宽
    async queryTotal() {
      this.loading = true
      try {
        const { data: res } = await getElastic({
          uri: 'filebeat-*/_search',
          postData: JSON.stringify({
            aggs: {
              0: {
                terms: {
                  field: 'server_port',
                  order: {
                    _key: 'asc'
                  },
                  size: 1
                },
                aggs: {
                  // 流入
                  'flow-in': {
                    sum: {
                      field: 'bytes_received'
                    }
                  },
                  // 流出
                  'flow-out': {
                    sum: {
                      field: 'bytes_sent'
                    }
                  },
                  // 流量总和
                  'flow-total': {
                    bucket_script: {
                      buckets_path: {
                        flowInValue: 'flow-in',
                        flowOutValue: 'flow-out'
                      },
                      script: 'params.flowInValue + params.flowOutValue'
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
        if (buckets.length) {
          const bucketObj = buckets[0] || {}
          // 总请求数
          this.totalData.request.value = bucketObj.doc_count || 0
          // 总流量
          const { val: flowVal, unit: flowUnit } = diskUnit(
            (bucketObj || {})['flow-total'].value
          )
          this.totalData.flow.value = flowVal
          this.totalData.flow.unit = flowUnit
        } else {
          this.totalData.request.value = 0
          this.totalData.flow.value = 0
          this.totalData.bandwidth.value = 0
        }
      } finally {
        this.loading = false
      }
    },

    // 查询排行数据
    async queryTopData() {
      this.topLoading = true
      try {
        const { timeValue } = this.query
        Object.keys(this.topData).forEach(async key => {
          const { data: res } = await getElastic({
            uri: 'filebeat-*/_search',
            postData: JSON.stringify(this.buildQueryTopData(key))
          })

          const obj = JSON.parse(res.data || '{}')
          if (!obj) return
          // 如果有数据
          const buckets = ((obj.aggregations || {})[0] || {}).buckets || []

          const topArr = buckets.map(item => {
            const flowIn = (item['flow-in'] || {}).value || 0
            const flowOut = (item['flow-out'] || {}).value || 0
            const flowTotal = (item['flow-total'] || {}).value || 0
            // const requestTotal = (item['request-total'] || {}).value || 0

            return {
              port: item.key,
              value: item.doc_count || 0,
              flowIn: diskUnit(flowIn).label,
              flowOut: diskUnit(flowOut).label,
              flow: diskUnit(flowTotal).label,

              bandwidthIn: bpsUnit((flowIn * 8) / timeValue).label,
              bandwidthOut: bpsUnit((flowOut * 8) / timeValue).label,
              bandwidth: bpsUnit((flowTotal * 8) / timeValue).label,

              request: item.doc_count || 0
            }
          })
          this.$set(this.topData, key, topArr)
        })
      } finally {
        this.topLoading = false
      }
    },

    // 构造查询的排行数据
    buildQueryTopData(type = 'request') {
      let sortAggs = {}
      if (type === 'flow' || type === 'bandwidth') {
        sortAggs = {
          sorted_diff: {
            bucket_sort: {
              sort: {
                'flow-total': {
                  order: 'desc'
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
              field: 'server_port',
              order: {
                _count: 'desc'
              },
              size: 10
            },
            aggs: {
              // 流入
              'flow-in': {
                sum: {
                  field: 'bytes_received'
                }
              },
              // 流出
              'flow-out': {
                sum: {
                  field: 'bytes_sent'
                }
              },
              // 流量总和
              'flow-total': {
                bucket_script: {
                  buckets_path: {
                    flowInValue: 'flow-in',
                    flowOutValue: 'flow-out'
                  },
                  script: 'params.flowInValue + params.flowOutValue'
                }
              },
              ...sortAggs

              // 排序
              // sorted_diff: {
              //   bucket_sort: {
              //     sort: {
              //       [`${sortKey}-total`]: {
              //         order: 'desc'
              //       }
              //     }
              //   }
              // }
            }
          }
        },
        size: 0,
        query: this.queryTime()
      }
    },

    // 构造查询数据
    buildQueryData() {
      const { step } = this.query
      const queryData = {
        aggs: {
          0: {
            terms: {
              // field: 'k_host.keyword',
              field: 'server_port',
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
                aggs: {
                  // 流入
                  'flow-in': {
                    sum: {
                      field: 'bytes_received'
                    }
                  },
                  // 流出
                  'flow-out': {
                    sum: {
                      field: 'bytes_sent'
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
      const { gte, lte, step, streams = [] } = this.query
      return {
        bool: {
          must: [
            // 查询指定数据
            {
              terms: {
                server_port: streams
              }
            },
            {
              wildcard: {
                'log.file.path': {
                  value: '*stream*'
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
