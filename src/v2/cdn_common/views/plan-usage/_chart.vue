<template>
  <div v-loading="$root.loading">
    <div class="my-lg rounded-2xl px-lg border border-ants-border-2">
      <el-row :gutter="20">
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 8 }"
          :md="{ span: 8 }"
          :lg="{ span: 8 }"
          :xl="{ span: 8 }"
          v-for="(item, idx) in totalList"
          :key="item.name + idx"
        >
          <ul class="space-y-8 my-df">
            <li class="font-bold">{{ antsT(item.name) }}</li>
            <li>
              <div class="inline-block total-flow-box">
                <span class="text-5xl">{{ item.value }} </span>
                <span> {{ antsT(item.unit) }}</span>
              </div>
            </li>
          </ul>
        </el-col>
      </el-row>
    </div>

    <div class="rounded-2xl p-2 bg-ants-bg-3" style="height: 400px">
      <div
        class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full relative"
      >
        <DownloadButton
          class="absolute top-0 right-0 mt-sm mr-xs"
          style="z-index: 99"
          ref="DownloadButtonRef"
          @getSeriesData="getSeriesData"
        />
        <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 导入 option
import baseOption from './option.js'
// 导入动态计算流量，带宽
import { flowUnit, bpsUnit } from '@/utils/public'
// 按钮
import DownloadButton from './components/DownloadButton.vue'
import { STEP } from '@/utils/unit'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPlanUsedFlow } = require(`@/v2/${PROCESS_NAME}/api/cdn/plan`)

export default {
  components: {
    DownloadButton
  },
  data() {
    return {
      // 图表配置项
      newChartOption: {
        series: []
      },
      // 单位
      unit: '',
      type: 'flow',

      totalList: [
        {
          name: '带宽峰值',
          value: 0,
          unit: 'Mbps'
        },
        {
          name: '总流量',
          value: 0,
          unit: 'KB'
        }
      ]
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

      const typeObj = {
        flow: '流量',
        bandwidth: '带宽'
      }
      const name = this.antsT(typeObj[this.type])

      return {
        title: {
          text: `${name}(${this.unit})`,
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
        },
        series: [
          {
            name: name
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
      const result = this.$_.merge(deepBaseOption, newColorOption)
      return result
    }
  },
  created() {},
  methods: {
    /**
     * @description: 根据数据渲染 line 图表
     */
    renderChart(form = {}) {
      this.$nextTick(() => {
        // 下载数据赋值
        this.$refs.DownloadButtonRef.queryObj = form

        this.getChartData(form)
      })
    },

    /**
     * @description: 点击下载
     */

    getSeriesData() {
      this.$refs.DownloadButtonRef.biuldData(this.newChartOption.series[0])
    },

    /**
     * @description: 动态计算流量
     */

    computedFlow(val = 0) {
      // 获取单位，获取几次幂
      const { pow, unit, value } = flowUnit(+val)
      return {
        unit,
        value
      }
    },

    /**
     * @description: 查询流量数据
     */

    async getChartData(form = {}) {
      this.$root.loading = true
      // 清除 chart 组件组件修改版
        const chartComponent = this.$refs.chartRef
        if (chartComponent && chartComponent.getEchartsInstance) {
          chartComponent.getEchartsInstance().clear()
        }

      const { start, end, serialNumber } = form
      const { data: res } = await getPlanUsedFlow({
        // 套餐绑定的订单号
        serialNumber,
        // 时间范围
        startTime: start,
        endTime: end
      })
      this.$root.loading = false

      if (res.code !== 1) return
      const dataObj = res.data || {}

      const mode = dataObj.mode

      /**
       *  data_total 总流量
       *  data_top 最大流量
       *  data_top_speed 带宽峰值
       *  data_value 95带宽|日均带宽
       */
      const { unit: totalUnit, value: totalValue } = this.computedFlow(
        dataObj.data_total
      )

      // 总流量
      if (mode == 1) {
        const peakBandwith = (dataObj.data_top * 8) / 300
        this.totalList = [
          {
            name: '带宽峰值',
            value: Math.ceil((peakBandwith / STEP / STEP) * 100) / 100,
            unit: 'Mbps'
          },
          {
            name: '总流量',
            value: totalValue,
            unit: totalUnit
          }
        ]
      }

      // 日均带宽、95带宽
      if (mode == 2 || mode == 3) {
        this.totalList = [
          {
            name: '带宽峰值',
            value:
              Math.ceil((dataObj.data_top_speed / STEP / STEP) * 100) / 100,
            unit: 'Mbps'
          },
          {
            name: '总流量',
            value: totalValue,
            unit: totalUnit
          },

          {
            name: mode == 2 ? '日均带宽' : '95th带宽',
            value: Math.ceil((dataObj.data_value / STEP / STEP) * 100) / 100,
            unit: 'Mbps'
          }
        ]
      }

      //  1 = 流量， 2 ,3 = 带宽
      let type = 'bandwidth'
      if (dataObj.mode === 1) {
        type = 'flow'
      }

      const arr = []
      let max = 0
      let maxTime = start
      if (res.data && typeof res.data.data === 'object') {
        const obj = res.data.data
        Object.keys(obj).forEach((key) => {
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

      this.type = type
      this.unit = unit

      // 合并配置项数据
      const mergeData = {
        // title: {
        //   text: `${name}(${unit})`
        // },
        legend: {
          show: false
        },
        series: [
          {
            id: unit,
            // name: name,
            data: dataArr
          }
        ]
      }

      this.newChartOption = mergeData
    },

    /**
     * @description: 计算值, 由于后台传递过来的数据已经转换过的，这里只做单位换算
     */

    computedValue(arr, max, type = '') {
      let dataArr = []
      let unitStr = ''
      // 流量
      if (type === 'flow') {
        // 获取单位，获取几次幂
        const { pow, unit } = flowUnit(+max)
        unitStr = unit
        dataArr = arr.map((item) => {
          return [
            item[0],
            Math.ceil((item[1] / Math.pow(STEP, pow)) * 100) / 100
          ]
        })
      }

      // 带宽
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
        dataArr = arr.map((item) => {
          return [
            item[0],
            Math.ceil((item[1] / Math.pow(STEP, IDX)) * 100) / 100
          ]
        })
      }

      return { dataArr, unit: unitStr }
    }
  }
}
</script>
