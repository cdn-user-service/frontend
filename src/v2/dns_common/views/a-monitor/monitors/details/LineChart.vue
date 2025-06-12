<template>
  <div v-loading="loading" class="h-full w-full">
    <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 导入默认图表配置项 option
import defaultOption from './time-line-option.js'

import { graphic } from 'echarts'

const areaStyleArr = [
  {
    opacity: 0.8,
    color: new graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: 'rgba(23,125,255, 0.16)'
      },
      {
        offset: 1,
        color: 'rgba(23,125,255, 0)'
      }
    ])
  },
  {
    opacity: 0.8,
    color: new graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: 'rgba(2,179,64, 0.16)'
      },
      {
        offset: 1,
        color: 'rgba(2,179,64, 0)'
      }
    ])
  },
  {
    opacity: 0.8,
    color: new graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: 'rgba(250,200,88, 0.16)'
      },
      {
        offset: 1,
        color: 'rgba(250,200,88, 0)'
      }
    ])
  }
]

const baseSeries = {
  type: 'line',
  // 是否平滑显示曲线
  smooth: true,
  showSymbol: false,
  // 名称
  name: '',
  lineStyle: {
    width: 1
  }
}

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
    initChart({
      // 是否清除图表
      clear = true,
      title = '',
      yAxisMax = null,
      yAxisLabel = null,
      series = [
        {
          name: '',
          data: []
        }
      ]
    }) {
      // 清除 chart 组件，以免造成数据错误
      if (clear && this.$refs.chartRef.$children.length) {
        this.$refs.chartRef.$children[0].clear()
      }

      const legendData = []
      const seriesData = series.map((item, idx) => {
        legendData.push(item.name)

        const newData = item.data
        // 需要去掉首尾为零的数据
        // if (newData.length > 2) {
        //   if (newData[0][1] == 0) {
        //     newData.shift()
        //   }
        //   if (newData[newData.length - 1][1] == 0) {
        //     newData.pop()
        //   }
        // }

        // // 再去掉一个末尾零
        // if (newData.length > 2) {
        //   if (newData[newData.length - 1][1] == 0) {
        //     newData.pop()
        //   }
        // }

        return {
          ...baseSeries,
          ...item,
          data: newData,
          // 仅第一项数据需要ID，作为formatter单位，可以不用
          // id: idx || unit,
          z: -idx,
          // 多条线时 z|zlevel 需要声明，不然控制台会报警告
          zlevel: -idx
          //   areaStyle: areaStyleArr[idx]
        }
      })

      const option = {
        title: {
          text: title
        },
        legend: {
          data: legendData
        },
        yAxis: {
          splitNumber: 2,
          max: (value) => {
            if (!yAxisMax) return null
            const max = value.max
            if (max && max > yAxisMax) {
              // 取20%的整数倍
              const percent5 = Math.floor(max / 5)
              const percentItem = Math.ceil(percent5 / 10) * 10
              return percentItem * 5
              // return Math.ceil(max / 10) * 10
            }
            return yAxisMax
          },
          axisLabel: {
            formatter: yAxisLabel,
            // 是否隐藏重叠标签
            hideOverlap: true
            // showMaxLabel: false
          }
        },
        series: seriesData
      }

      if (clear) {
        this.newChartOption = option
      } else {
        // 合并数据，不清除图表
        this.$refs.chartRef.$children[0].setOption(option)
      }
    }
  }
}
</script>
