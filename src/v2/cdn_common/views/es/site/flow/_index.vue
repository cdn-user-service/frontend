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
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 24 }"
        :xl="{ span: 24 }"
      >
        <div class="line-chart-box" v-loading="lineLoading">
          <LineChart :ref="`LineChartRef${key}`" />
        </div>
      </el-col>
      <!-- <el-col
        :xs="{ span: 24}"
        :sm="{ span: 24}"
        :md="{ span: 8}"
        :lg="{ span: 8}"
        :xl="{ span: 8}"
      >
        <TitleBorder>
          <strong class="text-sm">{{
            `TOP5 ${antsT(item)}${antsT('排行')}`
          }}</strong>
        </TitleBorder>
        <el-table
          :data="topData[key]"
          max-height="276"
          size="small"
          style="margin:0;"
        >
          <div slot="empty">
            <el-empty
              :description="antsT('暂无数据')"
              style="transform: scale(0.8);"
            />
          </div>
          <ants-table-column label="域名" prop="name"> </ants-table-column>
          <ants-table-column :label="item">
            <template #default="{ row }">
              {{ row.value }} {{ row.unit }}
            </template>
          </ants-table-column>
        </el-table>
      </el-col> -->
    </el-row>
  </div>
</template>

<script>
// 组件
import LineChart from '../../components/LineChart'
import { networkUnit, diskUnit, numUnit } from '@/utils/unit'
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
      console.log('query', this.query)
      if (!domains.length) {
        for (const key in titleObj) {
          const { computed } = queryObj[key]
          this.renderChart(key, computed([]))
        }
        return this.$msg.info('请选择域名')
      }

      this.queryTotal()
      this.toQuery()
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
            const { val, unit } = seriesData[0].total
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
                  field: 'k_host',
                  order: {
                    _key: 'asc'
                  },
                  size: 1
                },
                aggs: {
                  // 流入
                  'flow-in': {
                    sum: {
                      field: 'k_request_length'
                    }
                  },
                  // 流出
                  'flow-out': {
                    sum: {
                      field: 'l_out_size'
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
        console.log(obj)
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

    // 构造查询数据
    buildQueryData() {
      const { step } = this.query
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
                      field: 'k_request_length'
                    }
                  },
                  // 流出
                  'flow-out': {
                    sum: {
                      field: 'l_out_size'
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
