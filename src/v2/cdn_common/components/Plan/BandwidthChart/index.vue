<template>
  <div v-loading="loading" element-loading-spinner="el-icon-loading">
    <div class="flex justify-between items-center text-sm">
      <span>{{ nowCost.bindwith }}Mbps</span>
    </div>

    <div style="height:50px;width:100%;">
      <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

// 导入 option
import baseOption from './option.js'

// 查询数据
import { flow, bandwidth } from './query'
import { STEP } from '@/utils/unit'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
// const path = PROCESS_NAME === 'admin' ? 'product' : 'plan'

const { getPlanUsedFlow } = require(`@/v2/${PROCESS_NAME}/api/cdn/plan`)
// const { getPlanUsedFlow } = require(`@/v2/${PROCESS_NAME}/api/cdn/${path}`)
// import { getPlanUsedFlow } from '@/v2/cdn_users/api/cdn/plan'

export default {
  props: {
    // 查询类型
    // type: {
    //   type: String,
    //   default: 'bandwidth'
    // },
    serialNumber: {
      type: String,
      default: ''
    },

    // 数据源，可以不用请求接口，直接渲染
    chartData: {
      type: Object,
      default: () => ({
        data: {}
      })
    }
  },

  data() {
    return {
      type: 'bandwidth',
      loading: false,
      // 图表配置项
      newChartOption: {}
    }
  },
  computed: {
    // 计算费用
    nowCost() {
      let cost = 0
      let bindwith = 0
      const {
        mode,
        // 有效天数
        data_3_available_day: availableDay,
        // 自然月天数
        data_month_last_day: monthDay,
        // 套餐单价，以分为单位
        data_unit_price: price,

        // 后端计算的价格
        cur_paid_fee: paidFee
      } = this.chartData

      // 月95带宽
      if (mode == 3) {
        /**
         * 假设客户1月份有14天有效天，则计费带宽为这14天有效天的所有统计点14 * 288个,
         * 去掉最高的5%的点，剩余统计点中最高的为 Max95，Max95 即为计费带宽，
         * 1月的费用为：Max95 * P * 14 / 31
         *  */

        // 以字节为单位，需要转换为 MB
        const max95 = this.chartData.data_4_95value_bytes || 0
        bindwith = max95 / STEP / STEP
        cost = (bindwith * price * availableDay) / monthDay
        console.log(cost)
      }

      // 日峰值带宽
      if (mode == 2) {
        /**
         * 假设客户1月份有14天有效天，这14天有效天每一天的288个统计点最大值为：Max_1、Max_2、Max_3... Max_14
         * 计费带宽为 Average(Max_1, Max_2, ..., Max_14)
         * 1月的费用为：Average(Max_1, Max_2, ..., Max_14) * P * 14 / 31
         *  */

        // 以字节为单位，需要转换为 MB
        const average = this.chartData.data_4_average_max_value_bytes || 0
        bindwith = average / STEP / STEP
        cost = (bindwith * price * availableDay) / monthDay
      }

      return {
        cost: Math.ceil(cost) / 100,
        bindwith: Math.ceil(bindwith * 100) / 100,
        paidFee: (paidFee || 0) / 100
      }
    },

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
  created() {},
  mounted() {
    this.renderChart()
  },
  methods: {
    /**
     * @description: 根据数据渲染 line 图表
     */
    renderChart(form = {}) {
      this.$nextTick(() => {
        const date = new Date()
        date.setDate(1)
        date.setHours(0)
        date.setSeconds(0)
        date.setMinutes(0)

        const form = {
          type: 'bandwidth',
          // 产品订单号
          serialNumber: this.serialNumber,
          // 本月起始时间
          start: date.getTime(),
          end: new Date().getTime()
        }
        this.getChartData(form)
      })
    },

    /**
     * @description: 查询流量数据
     */

    async getChartData(form = {}) {
      this.loading = true
      // 清除 chart 组件，以免造成数据错误
      if (this.$refs.chartRef.$children.length) {
        this.$refs.chartRef.$children[0].clear()
      }

      const typeObj = {
        flow: '流量',
        bandwidth: '带宽'
      }

      const { start, end, serialNumber, type } = form
      // 不用请求
      // const { data: res } = await getPlanUsedFlow({
      //   // 套餐绑定的订单号
      //   serialNumber,
      //   // 时间范围
      //   startTime: start,
      //   endTime: end
      // })

      this.loading = false
      const arr = []
      let max = 0
      let maxTime = start
      if (typeof this.chartData === 'object') {
        const obj = this.chartData.data || {}
        Object.keys(obj).forEach(key => {
          if (obj[key] >= max) {
            max = obj[key]
            maxTime = key
          }
          arr.push([
            // 时间戳
            key * 1000,
            // 值
            obj[key]
          ])
        })
      }

      const { dataArr, unit } = this.computedValue(arr, max, type)
      const name = typeObj[type]

      // 合并配置项数据
      const mergeData = {
        title: {
          text: `${name}(${unit})`
        },
        legend: {
          show: false
        },
        series: [
          {
            id: unit,
            name: name,
            data: dataArr
          }
        ]
      }

      this.newChartOption = mergeData
    },

    /**
     * @description: 计算值
     */

    computedValue(arr, max, type = '') {
      let dataArr = []
      let unitStr = ''

      // 带宽，由于后台传递过来的数据已经转换过的，这里只做单位换算
      if (type === 'bandwidth') {
        const UNIT = [
          'Bbps',
          'Kbps',
          'Mbps',
          'Gbps',
          'Tbps',
          'Pbps',
          'Ebps',
          'Zbps',
          'Ybps'
        ]
        // 用于计算 IDX，避免出现 NaN
        let computedIdxVal = +max
        if (computedIdxVal < 1) {
          computedIdxVal = 1
        }
        const IDX = Math.floor(Math.log(computedIdxVal) / Math.log(STEP))
        unitStr = UNIT[IDX]
        dataArr = arr.map(item => {
          return [
            item[0],
            Math.ceil((item[1] / Math.pow(STEP, IDX)) * 100) / 100
          ]
        })
      }

      // 流量
      if (type === 'flow') {
      }

      return { dataArr, unit: unitStr }
    },

    /**
     * @description: 初始化数据
     * @param {*} baseData 接口获取的到基础数组数据
     * @param {*} form 查询数据，包括：时间范围、粒度
     * @param {*} computedValue 计算数值，为一个方法
     * @param {*} isNeedMax 为流量时，需要计算最大值
     * @return {arr} 返回初始化的数组数据
     */
    initChartArrData() {}
  }
}
</script>
