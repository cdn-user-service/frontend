<template>
  <div v-loading="loading" class="h-full w-full">
    <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

// 导入默认图表配置项 option
import defaultOption from './option.js'

export default {
  props: {
    // 自定义图表配置项，若不传则使用默认的
    // 自定义图表配置项，若不传则使用默认的
    option: {
      type: Object,
      default: () => ({})
    }
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
      if (this.layoutTheme.mainTheme === 'dark') {
        color = 'rgba(255,255,255,0.8)'
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
        series: [
          {
            label: {
              color
            }
          }
        ]
      }
    },
    // 图表总 option
    chartOption() {
      // 合并颜色配置项
      const newColorOption = this.$_.merge(
        this.newChartOption,
        this.colorOption
      )
      // 必须要深拷贝，不然数据会混乱
      const deepBaseOption = this.$_.cloneDeep(this.baseOption)

      return this.$_.merge(deepBaseOption, newColorOption)
    },
    // 图表配置项
    baseOption() {
      return {
        ...defaultOption,
        ...this.option
      }
    }
  },
  methods: {
    // 渲染图表
    async initChart({
      // 是否清除图表
      clear = true,
      title = '',
      tooltipFormatter,
      series = [
        {
          name: '',
          data: [
            // {
            //   name: '名称',
            //   value: 0, // 数量
            //   total: '0 unit', // 总量带单位
            //   label: '0 unit' // 数量带单位
            //   tag: '标签名称'
            // }
          ]
        }
      ]
    }) {
      // 清除 chart 组件组件修改版
        const chartComponent = this.$refs.chartRef
        if (chartComponent && chartComponent.getEchartsInstance) {
          chartComponent.getEchartsInstance().clear()
        }

      const option = {
        title: {
          text: title
        },
        tooltip: {
          formatter: tooltipFormatter
        },
        series
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
