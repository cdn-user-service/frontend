<template>
  <div class="">
    <div class="bg-ants-bg-1 p-lg rounded-2xl shadow mb-lg">
      <TitleBorder title="账户统计" />

      <div class="flex pt-lg">
        <div class="flex-1 text-center">
          <div class="font-semibold text-3xl">{{ userSum }}</div>
          <div class="text-sm text-ants-text-4 mt-sm">
            {{antsT('用户总数')}}
          </div>
        </div>
        <div class="flex-1 text-center">
          <div class="font-semibold text-3xl">{{ adminSum }}</div>
          <div class="text-sm text-ants-text-4 mt-sm">
            {{antsT('管理员总数')}}
          </div>
        </div>
      </div>

      <div
        style="height:150px;"
        class="mt-lg"
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

    <UserRegLine />
  </div>
</template>

<script>
import { getChartData } from '@/v2/cdn_admin/api/public'

import { mapState } from 'vuex'

// 导入 option
import baseOption from './option.js'
import UserRegLine from '../UserRegLine'

export default {
  components: {
    UserRegLine
  },
  props: {},
  data() {
    return {
      userSum: 0,
      adminSum: 0,
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
     * @description: 初始化 7天数据
     */

    async initWeekData() {
      this.loading = true
      try {
        const { data: res } = await getChartData({
          keys: 'app_user_login_7,user_sum,admin_sum'
        })
        this.loading = false
        const obj = res.data || {}
        this.userSum = obj.user_sum || 0
        this.adminSum = obj.admin_sum || 0
        
        const trueData = obj.app_user_login_7 || []
        const xAxisArr = []
        const yAxisArr = []

        for (let i = 0; i < 7; i++) {
          xAxisArr[i] =
            (trueData[i] && trueData[i].createdate.slice(0, 10)) || 0
          yAxisArr[i] = (trueData[i] && trueData[i].total) || 0
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
