<template>
  <Vcharts
    :theme="themeDefault"
    :option="option"
    :autoresize="autoresize"
    :style="{ width, height }"
    :manual-update="manualUpdate"
  />
</template>

<script>
// import 'echarts' // 全部引入，体积过大

// 默认主题
import themeDefault from '@/plugins/echart-map/theme-default.json'

import Vcharts from 'vue-echarts'

// echart 按需引入
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
// 按需导入图表
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GraphChart
} from 'echarts/charts'

// 按需导入组件
import {
  TitleComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  GraphicComponent,
  GeoComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
  VisualMapPiecewiseComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GraphChart,

  TitleComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  GraphicComponent,
  GeoComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
  VisualMapPiecewiseComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent
])

export default {
  name: 'AntsChart',
  components: {
    Vcharts
  },
  props: {
    option: {
      type: Object,
      default() {
        return {}
      }
    },
    /**
     * 在性能敏感（数据量很大）的场景下，我们最好对于 option prop 绕过 Vue 的响应式系统，
     * 当将 manual-update prop 指定为 true 且不传入 option prop 时，数据将不会被监听需要用,
     * 然后，需要用 ref 获取组件实例以后手动调用 setOption 方法来更新图表。
     * 默认为 false, 即不绕过 VUE的响应式系统
     */
    manualUpdate: Boolean,
    // 图表在组件根元素尺寸变化时是否需要自动进行重绘
    autoresize: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    }
  },
  data() {
    return {
      themeDefault,
      renderChart: false
    }
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      // console.log(Vcharts)
      this.renderChart = true
    })
  },
  methods: {}
}
</script>
