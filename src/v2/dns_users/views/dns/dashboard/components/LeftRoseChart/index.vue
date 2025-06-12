<template>
  <el-card class="mb-lg">
    <div class="font-bold">{{ antsT('财务统计') }}</div>

    <el-row class="py-lg text-center">
      <el-col :span="12">
        <div class="font-semibold">
          <span class="text-2xl">
            {{ rechargeTotal | priceFormat }}
          </span>
        </div>
        <div class="text-sm text-ants-text-4 mt-sm">
          {{ antsT('总充值') }}
        </div>
      </el-col>
      <el-col :span="12">
        <div class="font-semibold">
          <span class="text-2xl">
            {{ payTotal | priceFormat }}
          </span>
        </div>
        <div class="text-sm text-ants-text-4 mt-sm">
          {{ antsT('总消费') }}
        </div>
      </el-col>
    </el-row>

    <div
      v-loading="loading"
      class="flex justify-center w-full"
      style="height: 350px"
    >
      <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
    </div>
  </el-card>
</template>

<script>
import { mapState } from 'vuex'
// 导入默认图表配置项 option
import baseOption from './option.js'

export default {
  data() {
    return {
      loading: false,
      // 图表配置项
      newChartOption: {},

      rechargeTotal: 0,
      payTotal: 0,
      seriesData: []
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
            name: this.antsT('财务统计'),
            label: {
              color
            },
            data: this.seriesData.map((item) => {
              return {
                name: this.antsT(item.name),
                value: item.value
              }
            })
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
  created() {},
  mounted() {
    this.getChart()
  },
  methods: {
    // 构造数据
    getChart() {
      // 清除 chart 组件，以免造成数据错误
      if (this.$refs.chartRef.$children.length) {
        this.$refs.chartRef.$children[0].clear()
      }
      this.loading = true

      setTimeout(() => {
        this.loading = false
      }, 200)

      const rechargeTotal = this.rechargeTotal
      const payTotal = this.payTotal

      const seriesData = [
        {
          name: '总充值',
          value: rechargeTotal / 100
        },
        {
          name: '总消费',
          value: payTotal / 100
        },
        {
          name: '差额',
          value: Math.abs(rechargeTotal - payTotal) / 100
        }
      ]

      const mergeData = {
        series: [
          {
            name: '财务统计',
            data: seriesData
          }
        ]
      }
      this.seriesData = seriesData

      // 赋值
      // this.newChartOption = mergeData
    }
  }
}
</script>
