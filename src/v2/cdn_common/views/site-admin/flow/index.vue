<template>
  <el-card>
    <QueryTime @change="changeTime" v-model="query" hide5m class="mb-lg" />

    <EsFlow ref="EsFlowRef" />
  </el-card>
</template>

<script>
import EsFlow from '@/v2/cdn_common/views/es/site/flow'
import QueryTime from '@/v2/cdn_common/views/es/components/Query/Time'

export default {
  components: {
    EsFlow,
    QueryTime
  },
  data() {
    return {
      query: {
        // 粒度
        // step: '5s',
        // // 开启时间
        // gte: '5m',
        // // 结束时间
        // lte: null,
        // 域名
        domains: [this.$route.query.domain],
        // 区域
        area: 'china'
      }
    }
  },
  created() {
    this.getChart()
  },
  methods: {
    // 切换时间范围
    changeTime(val) {
      this.getChart()
    },

    getChart() {
      this.$nextTick(() => {
        this.$refs.EsFlowRef.getChart(this.query)
      })
    }
  }
}
</script>

<style lang="scss">
.line-chart-box {
  height: 260px;
  display: flex;
  border: 1px solid theme('colors.ants-border-2');
  border-radius: theme('borderRadius.2xl');

  @media screen and (max-width: 991px) {
    height: 220px;
  }

  @media screen and (max-width: 767px) {
    height: 200px;
  }
}
</style>
