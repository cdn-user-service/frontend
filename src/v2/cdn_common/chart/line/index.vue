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
    option: Object,

    // 对于 option 绕过 Vue 的响应式系统，需要用 ref 获取组件实例以后手动调用 setOption 方法来更新图表。
    manualUpdate: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      loading: false,
      // 图表配置项
      newChartOption: {},

      // 图表 legend data
      legendData: [],
      // 图表数据
      valuesArr: [],

      // 单位
      unit: ''
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

      // 单位
      const unit = this.unit && `（${this.antsT(this.unit)}）`
      // 标题
      const text = this.antsT(this.title) || this.antsT(this.queryData.title)

      return {
        title: {
          text: text + unit,
          textStyle: {
            color
          }
        },
        legend: {
          data: this.legendData.map(item => this.antsT(item)),
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
        },
        series: this.valuesArr.map(item => {
          return {
            ...item,
            name: this.antsT(item.name)
          }
        })
      }
    },

    // 图表 option
    chartOption() {
      // 合并颜色配置项
      const newColorOption = this.$_.merge(
        this.newChartOption,
        this.colorOption
      )

      // 必须要深拷贝，不然数据会混乱
      const deepBaseOption = this.$_.cloneDeep(this.baseOption)

      // 合并数据
      const result = this.$_.merge(deepBaseOption, newColorOption)
      return result
    },

    // 图表配置项
    baseOption() {
      return this.option || defaultOption
    }
  },
  created() {},
  methods: {
    /**
     * @description: 获取图表数据，并绘制图表
     * @param {*} form 查询数据
     * @return {*}
     */

    async getChart(form = {}) {
      // 清除 chart 组件修改版
    const chartComponent = this.$refs.chartRef
    if (chartComponent && chartComponent.getEchartsInstance) {
      chartComponent.getEchartsInstance().clear()
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

      // 图表 legend 名称
      let requestType = []
      // 图表数据
      const valuesArr = []
      this.unit = this.queryData.unit

      // 如果有数据
      if (
        chartData.data &&
        chartData.data.result &&
        chartData.data.result.length
      ) {
        let maxData = 0
        // 构造数据
        chartData.data.result.forEach((item, idx) => {
          // 设置 legend 数据
          requestType[idx] = this.queryData.requestTypeItem(item.metric)

          // 构造 图表 series 数据
          const { arr, max } = this.initChartArrData(
            item.values,
            FORM,
            this.queryData.computedValue,
            true
          )

          valuesArr[idx] = this.buildSeries(requestType[idx], arr, idx)

          // 取多条线中的最大值
          if (max > maxData) maxData = max
        })

        // 是否需要重新构造数据，流量、带宽需要重新构造数据，动态设置单位
        if (this.queryData.resetData) {
          chartData.data.result.forEach((item, idx) => {
            const { dataArr, unit } = this.queryData.resetData(
              valuesArr[idx].data,
              maxData,
              FORM
            )
            // 重置数据
            valuesArr[idx].data = dataArr
            // 重置单位
            this.unit = unit
            if (idx === 0) {
              valuesArr[idx].id = unit
            }
          })
        }
      } else {
        // 无数据设置为 0
        const { arr } = this.initChartArrData([], FORM)
        requestType = this.queryData.requestType

        requestType.forEach((item, idx) => {
          valuesArr[idx] = this.buildSeries(item, arr, idx)
        })
      }

      this.legendData = requestType
      this.valuesArr = valuesArr

      // 合并配置项数据
      const mergeData = {
        // title: {
        //   text:
        //     this.antsT(this.title) ||
        //     `${this.antsT(this.queryData.title)}（${this.antsT(
        //       this.unit
        //     )}）`
        // },
        // legend: {
        //   data: this.legendData
        // },
        yAxis: {
          max: this.queryData.yAxisMax || null
        }
        // series: valuesArr
      }

      this.newChartOption = mergeData
    },

    /**
     * @description: 构造图表 Series 数据
     * @param {*} name
     * @param {*} data
     * @param {*} idx
     * @return {*}
     */

    buildSeries(name = '', data = [], idx) {
      return {
        ...this.baseOption.series[0],
        // z: idx == 0 ? 5 : idx == 1 ? 4 : 3, // 层级
        // 仅第一项数据需要ID，作为formatter单位
        id: idx === 0 ? this.unit : this.unit + idx,
        // 名称
        name,
        // 值
        data,
        // 多条线时 z|zlevel 需要声明，不然控制台会报警告
        z: -idx,
        zlevel: -idx
      }
    },

    /**
     * @description: 初始化数据
     * @param {*} baseData 接口获取的到基础数组数据
     * @param {*} form 查询数据，包括：时间范围、粒度
     * @param {*} computedValue 计算数值，为一个方法
     * @param {*} isNeedMax 为流量时，需要计算最大值
     * @return {arr} 返回初始化的数组数据
     */
    initChartArrData(baseData = [], form, computedValue, isNeedMax) {
      const startTime = form.start * 1000
      const endTime = form.end * 1000
      const step = form.step * 1000

      // 将获取到的数据转为一维数组，方便indexOf
      let baseArr = []
      let max = 0
      if (isNeedMax) {
        const maxArr = []
        baseData.map((e, idx) => {
          baseArr[idx] = e[0] * 1000
          maxArr[idx] = e[1]
        })

        // 计算最大值
        max = Math.max(...maxArr)
      } else {
        baseArr = baseData.map(e => {
          return e[0] * 1000
        })
      }

      const arr = []
      const round = Math.floor((endTime - startTime) / step)

      for (let i = 0; i < round; i++) {
        // 查找当前时间点是否有值
        const nowTime = startTime + step * i
        const idx = baseArr.indexOf(nowTime)

        // 没有值置为 0、设置为 null 不渲染
        if (idx === -1) {
          arr[i] = [nowTime, 0]
          // arr[i] = [nowTime, null]
        } else {
          // 有值，计算对应的值
          arr[i] = [nowTime, computedValue(baseData[idx][1], form)]
        }
      }

      // 补上最后一点的时间
      // const endTimeIdx = baseArr.indexOf(endTime)
      // arr.push([
      //   endTime,
      //   endTimeIdx != -1 ? computedValue(baseData[endTimeIdx][1], form) : 0
      // ])

      return { arr, max }
    }
  }
}
</script>
