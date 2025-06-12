<template>
  <div class="chart-warp rounded-2xl p-2 bg-ants-bg-3">
    <div
      class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full"
    >
      <LineChart ref="LineChartRef" :query-data="qps" />
    </div>
  </div>
</template>

<script>
import { qps } from './js/line-query'
import LineChart from '@/v2/cdn_common/chart/line'

export default {
    components: {
        LineChart
    },
  data() {
    return {
        qps
    }
  },
  created() {},
  methods: {
    /**
     * @description: 渲染图表开始
     */    
    renderChart(form = {}) {
        this.$refs.LineChartRef.getChart(form)
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-warp {
  height: 350px;
  .chart-item {
    transition: all 0.3s;
    &:hover {
      box-shadow: 0px 0px 15px 1px rgba(23, 125, 255, 0.2);
    }
  }

  .rose-chart {
    width: 200px;
  }
  @media screen and (max-width: 991px) {
    height: 250px;
  }

  @media screen and (max-width: 767px) {
    height: 220px;
    .rose-chart {
      width: 100px;
    }
  }
}
</style>
