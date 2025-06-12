<template>
  <div
    v-loading="loading"
    element-loading-background="rgba(0, 0, 0, 0)"
    style="height:800px;"
  >
    <ants-chart ref="chartRef" manual-update />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts-gl'

// 模拟数据
import mapData from '@/plugins/echart-map/flights.json'

// 配置项数据
import baseOption from './option.js'

// 地图 JSON 文件
import china from '@/plugins/echart-map/china.json'
import world from '@/plugins/echart-map/world.json'
echarts.registerMap('world', world) // 在echarts中注册使用这个文件
echarts.registerMap('china', china) // 在echarts中注册使用这个文件

export default {
  data() {
    return {
      loading: false
    }
  },
  created() {},
  mounted() {
    this.getChart()
  },
  methods: {
    getChart() {
      this.$nextTick(async () => {
        // 清除 chart 组件，以免造成数据错误
        // this.$refs.chartRef.clear()
        this.loading = true

        if (this.$refs.chartRef.$children.length) {
          this.$refs.chartRef.$children[0].clear()
        }

        function getAirportCoord(idx) {
          return [mapData.airports[idx][3], mapData.airports[idx][4]]
        }

        const routes = mapData.routes.map((airline, index) => {
          return [getAirportCoord(airline[1]), getAirportCoord(airline[2])]
        })

        console.log(routes)

        const mergeData = {
          series: [
            {
              data: routes.slice(5000, 6000)
            }
          ]
        }
        setTimeout(() => {
          this.loading = false
          // 必须要深拷贝，不然数据会混乱
          const deepBaseOption = this.$_.cloneDeep(baseOption)
          // 合并数据
          const chartOption = this.$_.merge(deepBaseOption, mergeData)
          // 生成图表
          this.$refs.chartRef.$children[0].setOption(chartOption)
        }, 1000)
      })
    }
  }
}
</script>
