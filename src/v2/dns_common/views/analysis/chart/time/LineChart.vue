<template>
  <div
    v-loading="loading"
    class="h-full w-full"
  >
    <ants-chart
      v-bind="$attrs"
      ref="chartRef"
      :option="chartOption"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 导入默认图表配置项 option
import defaultOption from './option.js'

// api
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/dns/monitor`)

export default {
  components: {},
  props: {
    // 图表 title
    title: String,
    // 时间线图表查询数据
    queryData: Object,
    // 自定义图表配置项，若不传则使用默认的
    option: Object
  },
  data() {
    return {
      loading: false,
      // 图表配置项
      newChartOption: {}
    }
  },
  computed: {
    // 判断深浅主题
    ...mapState(['layoutTheme']),
    // 图表动态颜色配置项
    colorOption() {
      // 是否为深色主题
      let color = '#454545'
      let lineColor = '#eee'
      if (this.layoutTheme.mainTheme === 'dark') {
        color = 'rgba(255,255,255,0.8)'
        lineColor = '#2D3448'
      }

      return {
        title: {
          textStyle: {
            color
          }
        },
        legend: {
          textStyle: {
            color
          }
        },
        xAxis: {
          axisLabel: {
            color
          },
          axisLine: {
            lineStyle: {
              color: lineColor
            }
          }
        },
        yAxis: {
          axisLabel: {
            color
          },
          splitLine: {
            lineStyle: {
              color: lineColor
            }
          }
        }
      }
    },

    // 图表 option
    chartOption() {
      // 合并颜色配置项
      const newColorOption = this.$_.merge(
        this.newChartOption,
        this.colorOption
      )
      // 必须要深拷贝，不然数据会混乱
      const deepBaseOption = this.$_.cloneDeep(this.baseOption)
      // 合并数据
      return this.$_.merge(deepBaseOption, newColorOption)
    },

    // 图表配置项
    baseOption() {
      return this.option || defaultOption
    }
  },
  created() {},
  mounted() {},
  methods: {
    // 查询数据
    async getChart(query = {}) {
      const { domain, step, unit, range } = query
      if (!domain) return this.$msg.warning('请选择域名进行查询!')
      // 清除 chart 组件，以免造成数据错误
      if (this.$refs.chartRef.$children.length) {
        this.$refs.chartRef.$children[0].clear()
      }
      const queryObj = {
        query: {
          bool: {
            must: [
              {
                match: {
                  domain: {
                    query: domain,
                    operator: 'and'
                  }
                }
              },
              {
                range: {
                  timestamp: {
                    gte: 'now-' + range,
                    lte: 'now'
                  }
                }
              }
            ]
          }
        },
        aggs: {
          group_by_hour: {
            date_histogram: {
              field: 'timestamp',
              fixed_interval: step,
              time_zone: '+08:00',
              format: 'yyyy-MM-dd HH:mm:ss'
            },
            aggs: {
              sumtotal: {
                sum: {
                  field: 'total'
                }
              }
            }
          }
        }
      }
      this.loading = true
      try {
        const { data: res } = await getElastic({
          domain,
          uri: 'qps/_search?size=0',
          postData: JSON.stringify(queryObj)
        })
        this.loading = false

        // 存放数据的数组
        let valuesArr = []

        // 如果有数据
        if (res.data) {
          const obj = JSON.parse(res.data) || {}
          const arr =
            ((obj.aggregations || {}).group_by_hour || {}).buckets || []
          valuesArr = arr.map((item) => {
            const value = (item.sumtotal || {}).value || 0
            // QPS
            // return [item.key, Math.ceil(value / stepVal)]
            return [item.key, Math.ceil(value)]
          })
        }

        // 如果没有数据，则构造空数据
        if (!valuesArr.length) {
          valuesArr = this.buildEmptyData(range)
        }

        // 合并配置项数据
        const mergeData = {
          title: {
            text: `请求数/${unit}（${this.title}）`
          },
          legend: {
            data: ['请求数']
          },
          yAxis: {
            max: null
          },
          series: [
            {
              ...this.baseOption.series[0],
              // 仅第一项数据需要ID，作为formatter单位
              id: '次/' + unit,
              // 名称
              name: '请求数',
              // 值
              data: valuesArr
              // 多条线时 z|zlevel 需要声明，不然控制台会报警告
              // z: -idx,
              // zlevel: -idx
            }
          ]
        }

        this.newChartOption = mergeData
      } catch (error) {
        this.loading = false
        throw error
      }
    },

     // 构造查询时间范围内的空数据
    buildEmptyData(range = '1h') {
      const oneMinute = 60 * 1000
      const rangeObj = {
        '1h': {
          range: 60 * oneMinute,
          step: 1 * oneMinute
        },
        '1d': {
          range: 24 * 60 * oneMinute,
          step: 60 * oneMinute
        },
        '7d': {
          range: 7 * 24 * 60 * oneMinute,
          step: 60 * oneMinute
        },
        '30d': {
          range: 30 * 24 * 60 * oneMinute,
          step: 24 * 60 * oneMinute
        }
      }

      const queryObj = rangeObj[range] || rangeObj['1h']
      const { range: rangeVal, step: stepVal } = queryObj

      // 当前时间
      const nowTime = new Date().getTime()
      // rangeVal前
      const startTime = nowTime - rangeVal
      // 生成时间数组
      const timeArr = []
      for (let i = startTime; i <= nowTime; i += stepVal) {
        timeArr.push([i, 0])
      }

      return timeArr
    }
  }
}
</script>
