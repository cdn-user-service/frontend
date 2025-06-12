<template>
  <div
    style="height:510px;"
    class="bg-ants-bg-1 p-lg rounded-2xl shadow margin-bottom"
  >
    <TitleBorder title="财务统计" />

    <div class="flex pt-lg">
      <div class="flex-1 text-center">
        <div class="font-semibold text-success">
          <span>{{ $root.priceUnit }}</span>
          <span class="text-3xl">{{ (rechargeTotal / 100).toFixed(2) }}</span>
        </div>
        <div class="text-sm text-ants-text-4 mt-sm">
          总充值
        </div>
      </div>
      <div class="flex-1 text-center">
        <div class="font-semibold text-warning">
          <span>{{ $root.priceUnit }}</span>
          <span class="text-3xl">{{ (payTotal / 100).toFixed(2) }}</span>
        </div>
        <div class="text-sm text-ants-text-4 mt-sm">
          总消费
        </div>
      </div>
    </div>

    <div
      class="flex justify-center"
      style="height:350px;"
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
import { getChartData } from '@/v2/cdn_admin/api/public'

import { mapState } from 'vuex'

// 导入 option
import baseOption from './option.js'

export default {
  props: {},
  data() {
    return {
      loading: false,
      rechargeTotal: 0,
      payTotal: 0,
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

    async getChart(form = {}) {
      this.loading = true

      try {
        const { data: res } = await getChartData({
          keys: 'already_recharge_sum,already_pay_sum'
        })
        this.loading = false
        const obj = res.data || {}
        this.rechargeTotal = obj.already_recharge_sum || 0
        this.payTotal = obj.already_pay_sum || 0

        const seriesData = [
          {
            name: '总充值',
            value: this.rechargeTotal / 100
          },
          {
            name: '总消费',
            value: this.payTotal / 100
          },
          {
            name: '差额',
            value: Math.abs(this.rechargeTotal - this.payTotal) / 100
          }
        ]
        console.log(seriesData)

        const mergeData = {
          series: [
            {
              name: '财务统计',
              data: seriesData
            }
          ]
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
