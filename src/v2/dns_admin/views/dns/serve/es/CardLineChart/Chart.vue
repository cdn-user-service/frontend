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

import { graphic } from 'echarts'

export default {
  props: {
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
    // 渲染图表
    initChart(data = []) {
      // 清除 chart 组件，以免造成数据错误
      if (this.$refs.chartRef.$children.length) {
        this.$refs.chartRef.$children[0].clear()
      }

      this.newChartOption = {
        series: [
          {
            type: 'line',
            // 是否平滑显示曲线
            smooth: true,
            showSymbol: false,
            // 仅第一项数据需要ID，作为formatter单位
            id: '%',
            // 数据
            data,
            lineStyle: {
              width: 0
            },
            areaStyle: {
              opacity: 0.8,
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(23,125,255, 0.5)'
                },
                {
                  offset: 1,
                  color: 'rgba(23,125,255, 0.05)'
                }
              ])
            }
          }
        ]
      }
    }
  }
}
</script>
