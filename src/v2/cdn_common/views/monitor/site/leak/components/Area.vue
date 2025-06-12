<template>
  <div>
    <QueryArea ref="QueryAreaRef" @getChart="renderChart" />

    <el-row :gutter="20" class="mt-lg">
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
              title="攻击IP区域分布"
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
          <strong class="text-sm">请求数排行</strong>
        </TitleBorder>
        <el-table
          :data="topTableData"
          max-height="400"
          size="small"
          style="margin-top:10px;"
          v-loading="$root.loading"
        >
          <ants-table-column prop="name" label="省份"> </ants-table-column>
          <ants-table-column prop="value" label="请求数">
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
  </div>
</template>

<script>
// map 图
import MapChart from '@/v2/cdn_common/chart/map'
// 查询区域
import QueryArea from '../../../components/QueryArea'

// 站点监控
import { origin } from '../../js/map-query'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPrometheus } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

export default {
  components: {
    MapChart,
    QueryArea
  },
  data() {
    return {
      // 查询数据
      queryData: origin,
      // 表格排行数据
      topTableData: [],
      topTableTotal: 0,
      form: {}
    }
  },
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

        this.form = {
          ...form,
            // 获取区域类型
          area: this.$refs.QueryAreaRef.area
        }
        
        // 地图
          this.$refs.MapChartRef.getChart(this.form)
      })
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
