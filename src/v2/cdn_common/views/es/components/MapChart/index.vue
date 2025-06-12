<template>
  <div v-loading="loading" class="h-full w-full">
    <ants-chart v-bind="$attrs" ref="chartRef" :option="chartOption" />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { mapState } from 'vuex'
// 导入默认图表配置项 option
import defaultOption from './option.js'
// 导入中国省份，城市文件
import privenceArr from './privence'
// 地图 JSON 文件
import china from '@/plugins/echart-map/china.json'
import world from '@/plugins/echart-map/world.json'

// 在echarts中注册使用这个文件
echarts.registerMap('china', china)
echarts.registerMap('world', world)

export default {
  props: {
    // 自定义图表配置项，若不传则使用默认的
    option: {
      type: Object,
      default: () => ({})
    }
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
      let areaColor = '#eee'
      if (this.layoutTheme.mainTheme === 'dark') {
        color = 'rgba(255,255,255,0.8)'
        areaColor = '#383E4C'
      }

      return {
        title: {
          textStyle: {
            color
          }
        },
        visualMap: {
          textStyle: {
            color
          }
        },
        geo: {
          label: {
            color: color
          },
          itemStyle: {
            areaColor
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
      const deepBaseOption = this.$_.cloneDeep(this.baseOption)
      // 合并数据
      return this.$_.merge(deepBaseOption, newColorOption)
    },

    // 图表配置项
    baseOption() {
      return {
        ...defaultOption,
        ...this.option
      }
    }
  },
  methods: {
    // 渲染图表
    initChart({
      title = '',
      // 地图类型：'china' | 'world'
      map = 'china',
      series = [
        {
          name: '',
          data: [
            // {
            //     name: '北京',
            //     value: 0,
            //     label: '0 单位'
            // }
          ]
        }
      ]
    }) {
      this.$nextTick(() => {
        // 清除 chart 组件，以免造成数据错误
        if (this.$refs.chartRef.$children.length) {
          this.$refs.chartRef.$children[0].clear()
        }

        this.newChartOption = {
          title: {
            text: title
          },
          geo: {
            map,
            label: {
              show: map === 'china'
            }
          },
          series
        }
      })
    }
  }
}
</script>
