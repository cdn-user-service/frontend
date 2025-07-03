<template>
  <div v-loading="loading" element-loading-spinner="el-icon-loading">
    <div class="flex items-center justify-between text-sm">
      <span>Max95:188.88 Mbps</span>
      <span>{{ $root.priceUnit }}29.99</span>
    </div>
    <div style="height:40px;width:100%;">
      <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
    </div>
  </div>
</template>

<script>
// API
import { getPrometheus } from '@/v2/cdn_users/api/cdn/monitor'
import { mapState } from 'vuex'

// 导入 option
import baseOption from './option.js'

export default {
  data() {
    return {
      loading: true,
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

      return {}
    },

    // 图表总 option
    chartOption() {
      // 合并颜色配置项
      const newColorOption = this.$_.merge(this.newChartOption, this.colorOption)

      // 必须要深拷贝，不然数据会混乱
      const deepBaseOption = this.$_.cloneDeep(baseOption)

      // 合并数据
      const result = this.$_.merge(deepBaseOption, newColorOption)
      return result
    }
  },
  created() {},
  mounted() {
    this.initWeekData()
  },
  methods: {
    /**
     * @description: 初始化数据
     */

    initWeekData(trueData = []) {
      const xAxisArr = []
      const yAxisArr = []

      for (let i = 0; i < 30; i++) {
        const num = (Math.floor(Math.random() * 10) + 1) / 2
        xAxisArr[i] =
          (trueData[i] && trueData[i].createdate.slice(0, 10)) || num
        yAxisArr[i] = (trueData[i] && trueData[i].total) || num
      }

      this.getChart(xAxisArr, yAxisArr)
    },

    /**
     * @description: 获取图表数据，并绘制图表
     * @param {*} form 查询数据
     */

    async getChart(xAxisArr, yAxisArr) {
      // 清除 chart 组件组件修改版
        const chartComponent = this.$refs.chartRef
        if (chartComponent && chartComponent.getEchartsInstance) {
          chartComponent.getEchartsInstance().clear()
        }

      this.loading = true

      setTimeout(() => {
        this.loading = false
        // 虚拟数据
        const mergeData = {
          xAxis: {
            data: xAxisArr
          },
          series: [
            {
              name: 'in',
              data: yAxisArr
            }
          ]
        }

        // 赋值
        this.newChartOption = this.$_.merge(mergeData, this.option)
      }, 1000)
    }
  }
}
</script>
