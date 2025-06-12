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
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/dns/monitor`)

export default {
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
      // 接口获取到的图表数据，翻译需要
      chartData: {},

      // 需要中英文翻译，所以要这样单独拿出来
      // 单位
      unit: '',
      // 图表 legend data
      legendData: [],
      // 图表数据 series
      seriesData: []
    }
  },
  computed: {
    // 判断深浅主题
    ...mapState(['layoutTheme']),

    // 基础配置项
    baseOption() {
      return this.option || defaultOption
    },

    // 动态颜色配置项
    colorOption() {
      // 字体颜色，线条颜色
      let color = '#454545'
      let lineColor = '#eee'
      if (this.layoutTheme.mainTheme === 'dark') {
        color = 'rgba(255,255,255,0.8)'
        lineColor = '#2D3448'
      }

      // 单位
      const unit = this.unit && `（${this.antsT(this.unit)}）`
      // 标题，有限传递过来的title
      const titleText =
        this.antsT(this.title) || this.antsT(this.queryData.title)

      return {
        title: {
          text: titleText + unit,
          textStyle: {
            color
          }
        },
        legend: {
          data: this.legendData.map((item) => this.antsT(item)),
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
        },
        series: this.seriesData.map((item, idx) => {
          return {
            // 基本的配置项
            ...this.baseOption.series[0],
            // 数据
            data: item.data,
            // 仅第一项数据需要ID，作为formatter单位
            id: idx || (this.unit && this.antsT(this.unit)),
            // 名称
            name: this.antsT(item.name),
            // 多条线时 z|zlevel 需要声明，不然控制台会报警告
            z: -idx,
            zlevel: -idx
          }
        })
      }
    },

    // 最终合成的图表配置
    chartOption() {
      // 合并颜色配置项
      //   const newColorOption = this.$_.merge(this.chartData, this.colorOption)
      const newColorOption = this.$_.cloneDeep(this.colorOption)
      // 必须要深拷贝，不然数据会混乱
      const deepBaseOption = this.$_.cloneDeep(this.baseOption)
      // 合并数据
      return this.$_.merge(deepBaseOption, newColorOption)
    }
  },
  methods: {
    /**
     * @description: 获取图表数据，并构造图表数据
     */

    async getChart(query = {}) {
      // 清除 chart 组件，以免造成数据错误
      if (this.$refs.chartRef.$children.length) {
        this.$refs.chartRef.$children[0].clear()
      }

      const QUERY = {
        ...query
      }
      const { domain, time, step } = query
      const range = {
        gte: 'now-' + time,
        lte: 'now'
      }

      const queryObj = {
        query: {
          bool: {
            must: [
              {
                match: {
                  'decode_data.domain': {
                    query: domain,
                    operator: 'and'
                  }
                }
              },
              {
                range: {
                  self_timestamp: {
                    gte: range.gte,
                    lte: range.lte
                  }
                }
              }
            ]
          }
        },
        aggs: {
          group_by_hour: {
            date_histogram: {
              field: 'self_timestamp',
              fixed_interval: step,
              time_zone: '+08:00',
              format: 'yyyy-MM-dd HH:mm:ss'
            },
            aggs: {
              sumtotal: {
                sum: {
                  field: 'decode_data.total'
                }
              }
            }
          }
        }
      }

      this.loading = true
      try {
        const { data: res } = await getElastic({
          domain: query.domain,
          uri: 'sample/_search?size=0',
          postData: JSON.stringify(queryObj)
        })
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    }
  }
}
</script>
