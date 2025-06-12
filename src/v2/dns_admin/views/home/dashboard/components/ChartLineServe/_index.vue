<template>
  <div
    class="bg-ants-bg-1 p-lg rounded-2xl shadow mb-lg"
    style="height:510px;"
  >
    <TitleBorder title="Sever" />

    <div class="flex pt-lg">
      <div class="flex-1 text-center">
        <div class="font-semibold  text-3xl">666</div>
        <div class="text-sm text-ants-text-4 mt-sm">
          Total sales
        </div>
      </div>
      <div class="flex-1 text-center">
        <div class="font-semibold  text-3xl">8888</div>
        <div class="text-sm text-ants-text-4 mt-sm">
          Open Compaign
        </div>
      </div>
    </div>

    <div
      style="height:350px;"
      v-loading="loading"
      element-loading-spinner="el-icon-loading"
    >
      <ants-chart
        v-bind="$attrs"
        ref="chartRef"
        :option="chartOption"
      />
      <!-- <el-empty v-if="!ChartBox" description="暂无数据"> </el-empty> -->
    </div>
  </div>
</template>

<script>
import { getChartData } from '@/v2/dns_admin/api/public'

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
     */

    async getChart() {
      this.loading = true
      try {
        const { data: res } = await getChartData({
          keys: 'cpu,mem,disk'
        })
        this.loading = false
        console.log(res)
        // 虚拟数据
        const series = [
          {
            name: 'Highest',
            data: [7, 11, 13, 20, 12, 9, 8]
          },
          {
            name: 'Lowest',
            data: [3, 9, 10, 15, 16, 13, 5]
          }
        ]

        const mergeData = {
          series
        }

        // 赋值
        this.newChartOption = this.$_.merge(mergeData, this.option)
      } catch (error) {
        this.loading = false
        throw error
      }
    }
  }
}
</script>
