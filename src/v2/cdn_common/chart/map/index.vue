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
import privenceArr from './map-privenve'
// import cityArr from '../js/map-city' // 城市的不要

// 地图 JSON 文件
import china from '@/plugins/echart-map/china.json'
import world from '@/plugins/echart-map/world.json'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPrometheus } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

// 在echarts中注册使用这个文件
echarts.registerMap('china', china)
echarts.registerMap('world', world)

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
      let areaColor = '#eee'
      if (this.layoutTheme.mainTheme === 'dark') {
        color = 'rgba(255,255,255,0.8)'
        areaColor = '#383E4C'
      }

      return {
        title: {
          text: this.antsT(this.title || this.queryData.title),
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
      const result = this.$_.merge(deepBaseOption, newColorOption)
      return result
    },

    // 图表配置项
    baseOption() {
      return this.option || defaultOption
    }
  },
  methods: {
    /**
     * @description: 获取图表数据，并绘制图表
     * @param {*} form 查询数据
     */

    getChart(form = {}) {
      this.$nextTick(async () => {
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

        // 渲染图表 start
        const topTableData = []
        let topTableTotal = 0

        // 如果有数据
        if (
          chartData.data &&
          chartData.data.result &&
          chartData.data.result.length
        ) {
          // 构造数据
          chartData.data.result.forEach((item, idx) => {
            const nowValue = Math.ceil(item.value[1])

            if (nowValue != 0) {
              // 过滤掉 0
              const nowName = item.metric.filter_name.replace(
                /市|省|壮族自治区|回族自治区|维吾尔族自治区|自治区/g,
                ''
              )
              // 过滤掉其他国家的省区
              if (FORM.area === 'province') {
                if (privenceArr.indexOf(nowName) != -1) {
                  topTableData.push({
                    name: nowName,
                    value: nowValue
                  })
                }
                // } else if (FORM.area === 'city') {
                //   if (cityArr.indexOf(nowName) != -1) {
                //     topTableData.push({
                //       name: nowName,
                //       value: nowValue
                //     })
                //   }
              } else {
                topTableData.push({
                  name: nowName,
                  value: nowValue
                })
              }
              topTableTotal += +nowValue
            }
          })
        }

        // 对数据进行排序
        topTableData.sort((a, b) => {
          return b.value - a.value
        })

        // 设置父组件的 table 值
        this.$emit('update:topTableData', topTableData)
        this.$emit('update:topTableTotal', topTableTotal)

        let mapJson = 'china'
        let showNormal = true
        if (FORM.area == 'country') {
          mapJson = 'world'
          showNormal = false
        }

        const mergeData = {
          // title: {
          //   text: this.title || this.queryData.title
          // },
          geo: {
            map: mapJson,
            label: {
              show: showNormal
            }
          },
          series: [
            {
              data: topTableData
            }
          ]
        }

        // 赋值
        this.newChartOption = mergeData
      })
    }
  }
}
</script>
