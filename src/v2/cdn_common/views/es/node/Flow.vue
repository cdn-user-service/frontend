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
                element-loading-spinner="el-icon-loading"
              >
                <!-- v-loading="loadingObj[key]" -->
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
        <!-- v-loading="loadingObj[key]" -->
        <div class="line-chart-box">
          <LineChart :ref="`LineChartRef${key}`" />
        </div>
      </el-col>
      <!-- <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
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
import LineChart from '../components/LineChart'
// api
import { getElastic } from '@/v2/cdn_admin/api/cdn/monitor'

import queryObj from './query'

const titleObj = {
  bandwidth: '带宽',
  flow: '流量',
  requests: '请求数'
}
export default {
  components: {
    LineChart
  },
  data() {
    return {
      loading: false,
      roseLoading: false,
      titleObj,
      loadingObj: {
        bandwidth: false,
        flow: false,
        requests: false
      },

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
        requests: {
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
        requests: []
      },

      // 查询数据
      query: {}
    }
  },
  methods: {
    getChart({ gte, lte, step, nodes = [], append = 0 }) {
      this.query = {
        gte,
        lte,
        step,
        nodes,
        append
      }
      console.log('query', this.query)
      if (!nodes.length) return
      this.toQuery()
    },

    // 查询数据
    async toQuery() {
      for (const key in titleObj) {
        this.loadingObj[key] = true
        // 查询数据
        const { title, aggs, computed, yAxisLabel } = queryObj[key]

        // 加log看数据
        console.log('🚀 Sending request to ES:', {
          uri: 'metricbeat-*/_search',
          postData: this.buildQueryData(aggs, key)
        })

        try {
          const { data: res } = await getElastic({
            uri: 'metricbeat-*/_search',
            postData: JSON.stringify(this.buildQueryData(aggs, key))
          })

          const obj = JSON.parse(res.data || '{}')
          console.log(obj)
          if (!obj) return
          // 如果有数据
          const buckets = ((obj.aggregations || {})[0] || {}).buckets || []
          if (buckets.length) {
            const bucketObj = buckets[0] || {}
            const timeData = bucketObj[1].buckets || []
            this.$nextTick(() => {
              const series = computed(timeData)
              // 峰值带宽
              if (key === 'bandwidth') {
                const { val, unit } = series[1].total
                this.totalData.bandwidth.value = val
                this.totalData.bandwidth.unit = unit
              }
              // 总流量
              if (key === 'flow') {
                const { val, unit } = series[1].total
                this.totalData.flow.value = val
                this.totalData.flow.unit = unit
              }
              // 总请求数
              if (key === 'requests') {
                const { val } = series[0].total
                this.totalData.requests.value = val
              }

              this.renderChart(series, key)
            })
          } else {
            if (key === 'bandwidth') {
              this.totalData.bandwidth.value = 0
            }
            if (key === 'flow') {
              this.totalData.flow.value = 0
            }
            if (key === 'requests') {
              this.totalData.requests.value = 0
            }

            this.renderChart(computed([]), key)
          }
        } finally {
          this.loadingObj[key] = false
        }
      }
    },

    renderChart(series = [], key) {
      const { title, yAxisLabel } = queryObj[key]
      this.$refs[`LineChartRef${key}`][0].initChart({
        // 是否需要清除图表
        clear: this.query.append <= 1,
        // 标题
        title,
        // 最大值
        yAxisMax: null,
        // y轴标签
        yAxisLabel,
        // series数据
        series
      })
    },

    // 构造查询数据
    buildQueryData(aggs, type) {
      const { gte, lte, step, nodes = [] } = this.query
      const nginxQuerys =
        type === 'requests'
          ? [
              {
                match: {
                  'event.module': 'nginx'
                }
              }
            ]
          : []

      const queryData = {
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
            must: [
              // 查询指定域名
              {
                terms: {
                  // 'host.name': ['121.62.17.151']
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
      return queryData
    }
  }
}
</script>
