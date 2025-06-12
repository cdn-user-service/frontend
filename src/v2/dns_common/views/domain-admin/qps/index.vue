<template>
  <div class="content-box p-lg bg-ants-bg-1 shadow rounded-2xl">
    <div class="mb-lg">
      <TimeRange @change="changeTime" />

      <ants-button
        size="small"
        type="success"
        class="float-right"
        @click="getChartData()"
        :loading="btnLoading"
        icon="el-icon-refresh"
        text="刷新"
      />
    </div>
    <QpsChart ref="QpsChartRef" style="height: 400px;" />
  </div>
</template>

<script>
import QpsChart from '@/v2/dns_common/views/qps/Chart'
import TimeRange from '@/v2/dns_common/views/qps/TimeRange'
export default {
  components: {
    TimeRange,
    QpsChart
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      domain: this.$route.params.domain || '',
      // 当前选择时间范围
      timeObj: {
        range: '1h',
        label: '近1小时',
        step: '1m',
        stepVal: 60,
        unit: '分钟'
      }
    }
  },
  mounted() {
    this.getChartData()
  },
  methods: {
    // 选择时间范围
    changeTime(obj = {}) {
      this.timeObj = obj
      this.getChartData()
    },

    /**
     * @description: 查询数据
     */
    async getChartData() {
      if (this.domain === '') return
      this.btnLoading = true

      const { range, step, unit } = this.timeObj

      this.$nextTick(() => {
        this.$refs.QpsChartRef.getChart({
          domain: this.domain,
          step,
          range,
          unit
        })
        this.btnLoading = false
      })
    }
  }
}
</script>
