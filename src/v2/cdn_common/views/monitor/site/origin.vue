<template>
  <div class="mt-lg animated fadeIn">
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 14 }"
        :lg="{ span: 14 }"
        :xl="{ span: 14 }"
      >
        <div class="chart-warp rounded-2xl p-2 bg-ants-bg-3">
          <div
            class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full"
          >
            <MapChart
              ref="MapChartRef"
              :query-data="queryData"
              :topTableData.sync="topTableData"
              :topTableTotal.sync="topTableTotal"
            />
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
        <TitleBorder>
          <strong class="text-sm">{{antsT('访问用户区域排行')}}</strong>
        </TitleBorder>
        <el-table
          :data="topTableData"
          max-height="400"
          size="small"
          style="margin-top:10px;"
          v-loading="$root.loading"
        >
          <ants-table-column prop="name" label="省份"> </ants-table-column>
          <ants-table-column prop="value" label="访问次数">
            <template #default="{ row }"> {{ row.value }}次 </template>
          </ants-table-column>
          <ants-table-column label="占比">
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

    <el-row class="mt-xl" :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <TitleBorder>
          <strong class="text-sm">{{antsT('运营商分布排行')}}</strong>
        </TitleBorder>
        <ants-radio-group
          v-model="ispType"
          size="small"
          class="mt-lg"
          @change="queryIsp"
        >
          <ants-radio-button
            v-for="(value, key) in ispTypeObj"
            :key="key"
            :label="key"
            :text="value.title"
            />
        </ants-radio-group>

        <el-table
          :data="ispTableData"
          v-loading="$root.loading"
          style="margin-top:10px;"
        >
          <ants-table-column prop="name" label="区域"> </ants-table-column>
          <ants-table-column prop="xiaohao" :label="ispTypeObj[ispType].title">
            <template #default="{ row }">
              {{ row.value }} {{ ispType === 'bytes' ? row.unit : '次' }}
            </template>
          </ants-table-column>
          <ants-table-column :label="ispTypeObj[ispType].title + '占比'">
            <template #default="{ row }">
              {{ ((row.value / ispTableTotal) * 100).toFixed(2) }} %
            </template>
          </ants-table-column>
        </el-table>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <div class="chart-warp rose-chart rounded-2xl p-2 bg-ants-bg-3">
          <div
            class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full"
          >
            <RoseChart
              ref="RoseChartRef"
              :query-data="roseQueryData"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// map 图
import MapChart from '@/v2/cdn_common/chart/map'
// rose 图
import RoseChart from '@/v2/cdn_common/chart/rose'
// 站点监控
import { origin } from './js/map-query'
import { ispCode } from './js/rose-query'

// 转发端口监控
import { origin as streamOrigin } from '../stream/js/map-query'

// 导入动态计算流量
import { flowUnit } from '@/utils/public'

export default {
  components: {
    MapChart,
    RoseChart
  },
  data() {
    return {
      queryData: this.$route.name === 'StreamOrigin' ? streamOrigin : origin,
      // 访问用户区域排行数据
      topTableData: [],
      topTableTotal: 0,

      // 运营商分布排行
      roseQueryData: ispCode,
      ispType: 'bytes',
      ispTypeObj: {
        bytes: {
          title: '流量',
          unit: 'B'
        },
        requests: {
          title: '请求数',
          unit: '次'
        }
      },
      ispTableData: [],
      ispTableTotal: 0,

      // 查询数据
      form: {}
    }
  },
  computed: {},
  created() {
    this.renderChart()
  },
  methods: {
    /**
     * @description: 根据数据渲染 map 图表
     */

    renderChart() {
      this.$nextTick(async () => {
        // 查询数据
        const form = this.$listeners.getFormData()
        if (form.mode == 'site' && !form.host.length) return
        if (form.mode == 'stream' && !form.port.length) return

        this.form = {
          ...form
        } 
        // 地图
        this.$refs.MapChartRef.getChart(form)

        // 饼图
        this.queryIsp()
      })
    },

    /**
     * @description: 查询运营商数据
     */

    async queryIsp() {
      this.ispTableData = []
      this.ispTableTotal = 0

      this.form.type = this.ispType // 判断是流量还是请求数

      const { seriesData, totalData } = await this.$refs.RoseChartRef.getChart(
        this.form
      )
      console.log(seriesData, totalData)

      // 如果为流量则动态计算单位
      let arr = []
      if (this.ispType === 'bytes') {
        arr = seriesData.map(item => {
          const obj = flowUnit(item.value)
          return {
            ...item,
            value: obj.value,
            unit: obj.unit
          }
        })
      } else {
        arr = seriesData
      }
      console.log(arr)

      this.ispTableData = arr
      this.ispTableTotal = totalData || 1
    },

    /**
     * @description: 设置表格排行的值
     */

    setTableData(
      obj = {
        topTableData: [],
        topTableTotal: 0
      }
    ) {
      this.topTableData = obj.topTableData
      this.topTableTotal = obj.topTableTotal
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-warp {
  height: 500px;
  &.rose-chart {
    height: 450px;
  }
  .chart-item {
    transition: all 0.3s;
    &:hover {
      box-shadow: 0px 0px 15px 1px rgba(23, 125, 255, 0.2);
    }
  }
  @media screen and (max-width: 991px) {
    height: 400px;
    &.rose-chart {
      height: 350px;
    }
  }

  @media screen and (max-width: 767px) {
    height: 300px;
    &.rose-chart {
      height: 300px;
    }
  }
}
</style>
