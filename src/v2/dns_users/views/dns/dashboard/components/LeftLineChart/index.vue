<template>
  <div class="bg-ants-bg-1 p-lg rounded-2xl shadow mb-lg" style="height:500px;">
    <div class="font-bold">test</div>

    <el-row class="py-lg text-center">
      <el-col :span="8">
        <div class="font-semibold text-2xl">
          666
        </div>
        <div class="text-sm text-ants-text-4 mt-sm">
          Total sales
        </div>
      </el-col>
      <el-col :span="8">
        <div class="font-semibold text-2xl">
          8888
        </div>
        <div class="text-sm text-ants-text-4 mt-sm">
          Open Compaign
        </div>
      </el-col>
      <el-col :span="8">
        <div class="font-semibold text-2xl">
          555
        </div>
        <div class="text-sm text-ants-text-4 mt-sm">
          Open Compaign
        </div>
      </el-col>
    </el-row>

    <div
      v-loading="loading"
      class="flex justify-center w-full"
      style="height: 350px;"
    >
      <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

// 导入 option
import baseOption from './option.js'

export default {
  props: {},
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
      const newColorOption = this.$_.merge(
        this.newChartOption,
        this.colorOption
      )
      // 必须要深拷贝，不然数据会混乱
      const deepBaseOption = this.$_.cloneDeep(baseOption)
      // 合并数据
      return this.$_.merge(deepBaseOption, newColorOption)
    }
  },
  mounted() {
    this.getChart()
  },
  methods: {
    /**
     * @description: 获取图表数据，并绘制图表
     * @param {*} form 查询数据
     */

    async getChart(form = {}) {
      this.loading = true

      setTimeout(() => {
        this.loading = false
      }, 200)

      // 虚拟数据
      const series = [
        {
          name: 'Highest',
          data: [2, 12, 13, 20, 12, 9, 5]
        },
        {
          name: 'Lowest',
          data: [18, 8, 10, 15, 16, 13, 3]
        }
      ]

      const mergeData = {
        series
      }

      // 赋值
      this.newChartOption = mergeData
    }
  }
}
</script>
