<template>
  <div>
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
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
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <div class="p-lg border border-ants-border-2 rounded-2xl">
          <div class="flex justify-between">
            <TitleBorder>
              <strong class="text-sm">{{ antsT('状态码占比排行') }}</strong>
            </TitleBorder>

            <ants-radio-group size="mini" v-model="type" @change="changeTable">
              <ants-radio-button :label="1" text="总览" />
              <ants-radio-button :label="2" text="详情" />
            </ants-radio-group>
          </div>

          <el-table
            :data="topData"
            v-loading="loading"
            size="small"
            style="margin-top:10px;"
            height="240"
          >
            <ants-table-column label="状态码" prop="name"> </ants-table-column>
            <ants-table-column label="请求数">
              <template #default="{ row }"> {{ row.value }} 次 </template>
            </ants-table-column>
            <ants-table-column label="占比">
              <template #default="{ row }">
                {{ ((row.value / total) * 100 * 100) | priceFormat('%') }}
              </template>
            </ants-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <div class="line-chart-box mt-lg" v-loading="loading">
      <LineChart ref="LineChartRef" />
    </div>
  </div>
</template>

<script>
import { numUnit } from '@/utils/unit'
import RoseChart from '../../components/RoseChart'
import LineChart from '../../components/LineChart'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

const defaultTopData = [
  {
    name: '1xx',
    value: 0
  },
  {
    name: '2xx',
    value: 0
  },
  {
    name: '3xx',
    value: 0
  },
  {
    name: '4xx',
    value: 0
  },
  {
    name: '5xx',
    value: 0
  }
]
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
      total: 1,
      topData: defaultTopData,
      overviewTable: [],
      detailTable: []
    }
  },
  methods: {
    getChart(query = {}) {
      console.log('query', query)
      this.query = query

      if (!query.domains.length) return
      this.toQuery()
    },

    changeTable(val) {
      this.topData = val === 1 ? this.overviewTable : this.detailTable
      this.renderRoseChart()
    },

    // 查询状态码数据
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
        console.log('buckets', buckets)
        // 如果有数据
        if (buckets.length) {
          const bucketObj = buckets[0] || {}
          const timeData = bucketObj.total.buckets || []
          console.log('timeData', timeData)
          const obj = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
          let total = 0
          const allArr = []
          timeData.forEach(item => {
            const codePre = item.key[0]
            const value = item.doc_count || 0
            obj[codePre] += value
            total += value
            allArr.push({
              name: item.key,
              value
            })
          })
          this.total = total
          const arr = []
          Object.keys(obj).forEach(key => {
            arr.push({
              name: key + 'xx',
              value: obj[key]
            })
          })
          // 排序
          this.overviewTable = arr.sort((a, b) => b.value - a.value)
          this.detailTable = allArr.sort((a, b) => b.value - a.value)
          this.topData = this.type == 1 ? this.overviewTable : this.detailTable
          this.renderRoseChart()
          this.renderLineChart(bucketObj.line.buckets)
        } else {
          this.topData = []
          this.total = 0
          this.renderRoseChart()
          this.renderLineChart()
        }
      } finally {
        this.loading = false
      }
    },

    // 渲染饼图
    renderRoseChart() {
      let seriesData = this.topData.map(item => {
        return {
          name: item.name,
          value: item.value,
          label: `${item.value} 次`,
          total: `${this.total} 次`
        }
      })
      if (!seriesData.length) {
        seriesData = defaultTopData.map(item => {
          return {
            name: item.name,
            value: 0,
            label: '0 次',
            total: '0 次'
          }
        })
      }
      this.$refs.RoseChartRef.initChart({
        title: '状态码占比',
        series: [
          {
            name: '状态码占比',
            data: seriesData
          }
        ]
      })
    },

    // 渲染折线图
    renderLineChart(data = []) {
      const obj = {}
      for (let i = 1; i <= 5; i++) {
        obj[`${i}xx`] = {
          name: `${i}xx`,
          data: []
        }
      }
      data.forEach(item => {
        const time = item.key
        for (let i = 1; i <= 5; i++) {
          const value = item[`${i}xx`].doc_count || 0
          obj[`${i}xx`].data.push([time, value, `${value}次`])
        }
      })

      if (!data.length) {
        for (let i = 1; i <= 5; i++) {
          obj[`${i}xx`].data.push([new Date().getTime(), 0, '0次'])
        }
      }
      const series = []
      Object.keys(obj).forEach(key => {
        series.push(obj[key])
      })
      console.log('obj', obj)
      this.$refs.LineChartRef.initChart({
        // 标题
        title: '状态码趋势',
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
      const aggs = {}
      for (let i = 1; i <= 5; i++) {
        aggs[`${i}xx`] = {
          // 聚合 l_return_code 以2开头的状态码
          filter: {
            prefix: {
              l_return_code: i + ''
            }
          }
        }
      }
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
                  field: 'l_return_code',
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
