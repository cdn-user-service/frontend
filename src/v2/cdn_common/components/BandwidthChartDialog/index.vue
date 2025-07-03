<template>
  <ants-dialog
    title="8月95带宽计费【测试套餐】"
    ref="dialogRef"
    v-model="dialogVisible"
    width="1200px"
    @close="resetForm"
  > 
  <div class="mb-sm">
    Max95: <strong class="text-primary">1888.88</strong> Mbps
    <span class="ml-lg">{{ $root.priceUnit }}199.99</span>
  </div>
    <div style="height:400px;width:100%;" v-loading="loading">
      <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
    </div>
    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        @click="dialogVisible = false"
        text="关 闭"
      />
    </template>
  </ants-dialog>
</template>

<script>
import { mapState } from 'vuex'

// 导入 option
import baseOption from './option.js'

export default {
  data() {
    return {
      dialogVisible: false,
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

      return {
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
  methods: {
    /**
     * @description: 对话框显示
     * @param {*} html
     */

    showDialog() {
      this.dialogVisible = true
      this.initWeekData()
    },

    /**
     * @description: 初始化 90天数据
     */

    initWeekData(trueData = []) {
      const xAxisArr = []
      const yAxisArr = []

      for (let i = 0; i < 100; i++) {
        const num = (Math.floor(Math.random() * 10) + 1) / 2
        xAxisArr[i] =
          (trueData[i] && trueData[i].createdate.slice(0, 10)) || num
        yAxisArr[i] = (trueData[i] && trueData[i].total) || num
      }
      this.$nextTick(() => {
        this.getChart(xAxisArr, yAxisArr)
      })
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
              data: yAxisArr
            }
          ]
        }

        // 赋值
        this.newChartOption = this.$_.merge(mergeData, this.option)
      }, 200)
    },

    // 表单重置
    resetForm() {}
  }
}
</script>
