<template>
  <div v-loading="loading" class="h-full w-full">
    <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

// 导入默认图表配置项 option
import defaultOption from './option.js'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPrometheus } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

export default {
  props: {
    // 图表 title
    title: String,
    // 时间线图表查询数据
    queryData: Object,
    // 自定义图表配置项，若不传则使用默认的
    option: Object
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
          text: this.antsT(this.title || this.queryData.title),
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
      const deepBaseOption = this.$_.cloneDeep(defaultOption)

      // 合并数据
      const result = this.$_.merge(deepBaseOption, newColorOption)
      return result
    }
  },
  methods: {
    /**
     * @description: 获取图表数据，并绘制图表
     * @param {*} form 查询数据
     */

    async getChart(form = {}) {
      // 清除 chart 组件，以免造成数据错误
      if (this.$refs.chartRef.$children.length) {
        this.$refs.chartRef.$children[0].clear()
      }

      const FORM = {
        ...form
      }
      this.loading = true
      const { data: res } = await getPrometheus(this.queryData.queryObj(FORM))
      this.loading = false

      // 解析数据
      if (!res.data) return this.$msg.error('未查询到数据！')

      const chartData = JSON.parse(res.data || [])

      // 初始化数据
      let seriesData = this.queryData.initData() || []
      // 总数
      let totalData = 0

      // 如果有数据
      if (
        chartData.data &&
        chartData.data.result &&
        chartData.data.result.length
      ) {
        // 构造数据
        const { arr, total } = this.queryData.buildData(chartData.data.result)
        seriesData = arr
        totalData = total
      }

      // 设置 title
      const title = this.title || this.queryData.title

      const mergeData = {
        // title: {
        //   text: title
        // },
        tooltip: {
          formatter: this.queryData.formatter
        },
        series: [
          {
            name: title,
            data: seriesData
          }
        ]
      }

      // 赋值
      this.newChartOption = this.$_.merge(mergeData, this.option)

      return { seriesData, totalData }
    }
  }
}
</script>
