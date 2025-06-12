<template>
  <el-card class="content-box animated fadeIn">
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
            <MapChart
              ref="MapChartRef"
              title="来源数据"
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
        <div class="font-bold">TOP来源数据排行</div>
        <el-table
          :data="topTableData"
          height="470"
          size="mini"
          border
          style="margin-top:10px;"
          v-loading="$root.loading"
        >
          <ants-table-column prop="name" label="省份" align="center"> </ants-table-column>
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
import MapChart from '@/v2/dns_common/components/chart/map'

export default {
  components: {
    MapChart
  },
  data() {
    return {
      topTableData: [],
      topTableTotal: 0
    }
  },
  created() {
    this.renderChart()
  },
  methods: {
    renderChart() {
      this.$nextTick(async () => {
        const form = {

        }
        // 地图
        this.$refs.MapChartRef.getChart(form)
      })
    }
  }
}
</script>
