<template>
  <div class="bg-ants-bg-1 p-lg rounded-2xl shadow">
    <div class="flex justify-between items-center">
      <TitleBorder title="7天注册用户" />
      <span class="text-sm font-semibold mt-sm"> 总：{{ regSum }} </span>
    </div>

    <div
      style="height:130px;"
      v-loading="loading"
      element-loading-spinner="el-icon-loading"
    >
      <ants-chart
        v-bind="$attrs"
        ref="chartRef"
        :option="chartOption"
      />
    </div>
  </div>
</template>

<script>
import { getChartData } from '@/v2/dns_admin/api/public'

import { mapState } from 'vuex'

// 导入 option
import baseOption from './option.js'

export default {
  data() {
    return {
      regSum: 0,
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
    this.initWeekData()
  },
  methods: {
    /**
     * @description: 初始化 7天 数据
     */

    async initWeekData() {
      this.loading = true
      try {
        const { data: res } = await getChartData({
          keys: 'app_user_reg_7'
        })
        this.loading = false
        const obj = res.data || {}
        const trueData = obj.app_user_reg_7 || []

        const valueArr = []
        let regSum = 0
        // 解析初始数据
        const timeArr = trueData.map((item, idx) => {
          valueArr[idx] = item.total
          regSum += item.total
          return item.createdate.slice(0, 10)
        })
        this.regSum = regSum

        // 构造 近7天的数据
        const xAxisArr = []
        const yAxisArr = []

        const today = new Date()
        for (let i = 0; i < 7; i++) {
          const day = new Date(today)
          const nowDateStr = this.getStrDate(day.setDate(today.getDate() - i))
          const index = timeArr.indexOf(nowDateStr)
          let value = 0
          if (index != -1) {
            value = valueArr[index]
          }
          xAxisArr.unshift(nowDateStr)
          yAxisArr.unshift(value)
        }

        this.getChart(xAxisArr, yAxisArr)
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    getStrDate(date) {
      const today = new Date(date)
      const yyyy = today.getFullYear()
      const mm = (today.getMonth() + 1 + '').padStart(2, '0')
      const dd = (today.getDate() + '').padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    },

    /**
     * @description: 获取图表数据，并绘制图表
     * @param {*} form 查询数据
     */

    async getChart(xAxisArr, yAxisArr) {
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
    }
  }
}
</script>
