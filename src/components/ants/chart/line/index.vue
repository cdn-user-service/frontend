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

export default {
  name: 'AntsChartLine',
  props: {
    // 图表 title
    title: String,
    // 时间线图表查询数据
    queryData: Object,
    // 自定义图表配置项，若不传则使用默认的
    option: Object,

    // 对于 option 绕过 Vue 的响应式系统，需要用 ref 获取组件实例以后手动调用 setOption 方法来更新图表。
    manualUpdate: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      // 图表配置项
      newChartOption: {},

      // 图表 legend data
      legendData: [],
      // 图表数据
      valuesArr: []
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
          text: this.title,
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
  methods: {
    // 渲染图表
    async getChart(form = {}, seriesData = []) {
      // 清除 chart 组件，以免造成数据错误
      if (this.$refs.chartRef.$children.length) {
        this.$refs.chartRef.$children[0].clear()
      }
      const FORM = {
        ...form
      }

      console.log('seriesData', seriesData)
      const defaultSeries = defaultOption.series[0]
      this.loading = true
      setTimeout(() => {
        this.loading = false

        // 虚拟数据
        const mergeData = {
          //   xAxis: {
          //     data: xAxisArr
          //   },
          series: seriesData.map(item => {
            return {
              ...defaultSeries,
              ...item
            }
          })
        }

        // 赋值
        this.newChartOption = this.$_.merge(mergeData, this.option)
      }, 500)
    }
  }
}
</script>
