<template>
  <div
    class="bg-ants-bg-1 p-lg rounded-2xl shadow mb-lg" style="height:500px;"
  >
    <TitleBorder title="流量统计" />

    <div class="flex pt-lg">
      <div class="flex-1 text-center">
        <div class="font-semibold  text-3xl">666</div>
        <div class="text-sm text-ants-text-4 mt-sm">
          WAF攻击次数
        </div>
      </div>
      <div class="flex-1 text-center">
        <div class="font-semibold  text-3xl">8888</div>
        <div class="text-sm text-ants-text-4 mt-sm">
          CC攻击次数
        </div>
      </div>
    </div>

    <div
      style="height:300px;"
      v-loading="loading"
      element-loading-spinner="el-icon-loading"
    >
      <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
      <!-- <el-empty v-if="!ChartBox" description="暂无数据"> </el-empty> -->
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

// 导入 option
import baseOption from './option.js'

export default {
  props: {
    title: {
      type: String,
      default: 'title'
    }
  },
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
  mounted() {
    this.initWeekData()
  },
  methods: {
    /**
     * @description: 初始化 90天数据
     */

    initWeekData(trueData = []) {
      const xAxisArr = []
      const yAxisArr = []
      const outArr = []

      for (let i = 0; i < 30; i++) {
        const num = Math.floor(Math.random() * 10) + 1
        xAxisArr[i] =
          (trueData[i] && trueData[i].createdate.slice(0, 10)) || num
        yAxisArr[i] = (trueData[i] && trueData[i].total) || num
        outArr[i] = Math.floor(Math.random() * 10) + 1
      }

      this.getChart(xAxisArr, yAxisArr, outArr)
    },

    /**
     * @description: 获取图表数据，并绘制图表
     * @param {*} form 查询数据
     */

    async getChart(xAxisArr, yAxisArr, outArr) {
      this.loading = true

      setTimeout(() => {
        this.loading = false
      }, 200)

      // 虚拟数据
      const mergeData = {
        xAxis: {
          data: xAxisArr
        },
        series: [
          {
            name: 'in',
            data: yAxisArr
          },
          {
            name: 'out',
            data: outArr
          }
        ]
      }

      // 赋值
      this.newChartOption = this.$_.merge(mergeData, this.option)
    }
  }
}
</script>
