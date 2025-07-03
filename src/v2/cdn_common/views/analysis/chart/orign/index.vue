<template>
  <el-card class="content-box animated fadeIn">
    <div class="pb-lg">
      <ants-radio-group
        v-model="query.range"
        size="small"
        @change="changeTimeRange"
        class="mr-df"
      >
        <ants-radio-button
          v-for="(item, key) in timeRange"
          :key="item"
          :label="key"
          :disabled="loading"
          :text="item"
        />
      </ants-radio-group>

      <ants-radio-group v-model="query.area" size="small" @change="changeArea">
        <ants-radio-button
          v-for="(item, key) in areaObj"
          :key="item"
          :label="key"
          :disabled="loading"
          :text="item"
        />
      </ants-radio-group>
    </div>
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 14 }"
        :lg="{ span: 14 }"
        :xl="{ span: 14 }"
      >
        <div
          class="chart-warp rounded-2xl p-2 bg-ants-bg-3"
          style="height:500px;"
        >
          <div
            class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full"
          >
            <div v-loading="loading" class="h-full w-full">
              <ants-chart
                v-bind="$attrs"
                ref="chartRef"
                :option="chartOption"
              />
            </div>
          </div>
        </div>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 10 }"
        :lg="{ span: 10 }"
        :xl="{ span: 10 }"
      >
        <div class="font-bold">TOP来源数据排行</div>
        <el-table
          :data="topTableData"
          height="470"
          size="mini"
          border
          style="margin-top:10px;"
          v-loading="loading"
        >
          <ants-table-column
            prop="name"
            :label="query.area === 'china' ? '省份' : '国家'"
            align="center"
          >
          </ants-table-column>
          <ants-table-column prop="value" label="访问次数" align="center">
            <template #default="{ row }"> {{ row.value }}次 </template>
          </ants-table-column>
          <ants-table-column label="占比" align="center">
            <template #default="{ row }">
              <span v-if="!row.value">0%</span>
              <span v-else>
                {{ ((row.value / topTableTotal) * 100).toFixed(2) }}%
              </span>
            </template>
          </ants-table-column>
        </el-table>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import { mapState } from 'vuex'
// 导入默认图表配置项 option
import defaultOption from './option'
// 导入中国省份，城市文件
import provinceArr from './province'

// 地图 JSON 文件
import china from '@/plugins/echart-map/china.json'
import world from '@/plugins/echart-map/world.json'

// 在echarts中注册使用这个文件
echarts.registerMap('china', china)
echarts.registerMap('world', world)

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

const areaObj = {
  world: '全球分布',
  china: '全国分布'
}
const timeRange = {
  '1h': '近1小时',
  '6h': '近6小时',
  '24h': '近24小时'
}
export default {
  components: {},
  data() {
    return {
      loading: false,
      areaObj,
      timeRange,
      query: {
        area: 'world',
        range: '1h'
      },
      topTableData: [],
      topTableTotal: 0,
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
          text: this.antsT('来源数据'),
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

      return this.$_.merge(deepBaseOption, newColorOption)
    },

    // 图表配置项
    baseOption() {
      return this.option || defaultOption
    }
  },
  created() {
    this.getChart()
  },
  methods: {
    // 切换区域
    changeArea(val) {
      this.getChart()
    },

    // 切换时间范围
    changeTimeRange(val) {
      this.getChart()
    },

    // 获取图表数据并渲染
    getChart() {
      this.$nextTick(async () => {
        // 清除 chart 组件组件修改版
        const chartComponent = this.$refs.chartRef
        if (chartComponent && chartComponent.getEchartsInstance) {
          chartComponent.getEchartsInstance().clear()
        }
        const queryObj = this.buildQueryData()

        this.loading = true
        try {
          const { data: res } = await getElastic({
            uri: '/query-log/_search',
            postData: JSON.stringify(queryObj)
          })
          this.loading = false

          // 存放数据的数组
          let topTableData = []
          let topTableTotal = 0

          // 如果有数据
          if (res.data) {
            const obj = JSON.parse(res.data) || {}
            console.log(obj)
            const arr =
              ((obj.aggregations || {}).from_filter || {}).buckets || []
            topTableData = arr.map(item => {
              const value = item.doc_count || 0
              topTableTotal += value
              return {
                name: item.key,
                value
              }
            })
          }

          const { area } = this.query
          this.newChartOption = {
            geo: {
              map: area,
              label: {
                show: area != 'world'
              }
            },
            series: [
              {
                data: topTableData
              }
            ]
          }
          this.topTableData = topTableData
          this.topTableTotal = topTableTotal
        } catch (error) {
          this.loading = false
          throw error
        }
      })
    },

    // 构造查询数据
    buildQueryData() {
      const { area, range } = this.query

      const aggsKeyword = area === 'world' ? 'country_name' : 'region_name'
      const queryObj = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  timestamp: {
                    gte: 'now-' + range,
                    lte: 'now'
                  }
                }
              }
              // {
              //   terms: {
              //     'from.country_name.keyword': ['China']
              //   }
              // }
            ]
          }
        },
        aggs: {
          from_filter: {
            terms: {
              field: `from.${aggsKeyword}.keyword`,
              size: '10000'
            }
          }
        }
      }

      // 如果选择全国分布，需要过滤
      if (area === 'china') {
        queryObj.query.bool.must.push({
          terms: {
            'from.country_name.keyword': [
              'China',
              'Hong Kong',
              'Taiwan',
              'Macao'
            ]
          }
        })
      }
      return queryObj
    }
  }
}
</script>
