<template>
  <div class="domain-qps-box content-box p-lg bg-ants-bg-1 shadow rounded-2xl">
    <div class="mb-lg">
      <TimeRange @change="changeTime" />

      <!-- 选择域名-->
      <SelectDomain
        @change="changeSelectDomain"
        ref="SelectDomainRef"
        class="mr-sm"
      />

      <ants-button
        size="small"
        type="primary"
        @click="getChartData()"
        :loading="btnLoading"
        icon="el-icon-search"
        text="查询"
      />

      <ants-button
        type="success"
        size="small"
        style="float:right;"
        icon="el-icon-refresh"
        :loading="btnLoading"
        @click="getChartData()"
        text="刷新"
      />
    </div>

    <el-empty v-if="!domains.length" description="请选择域名进行查询" />
    <el-row v-else :gutter="15">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
        v-for="(item, idx) in domains"
        :key="item + idx"
      >
        <div class="chart-warp mb-df rounded-2xl">
          <div
            class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full"
          >
            <QpsChart :ref="`QpsChartRef${idx}`" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// 组件
import SelectDomain from '@/v2/dns_common/components/SelectDomain'
import TimeRange from './TimeRange.vue'
import QpsChart from './Chart.vue'

export default {
  components: {
    SelectDomain,
    QpsChart,
    TimeRange
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      // 当前查询的域名数组
      domains: [],
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
  computed: {},
  mounted() {},
  methods: {
    // 选择域名
    changeSelectDomain({ domains, domainIds }) {
      this.domains = domains || []
      this.getChartData()
    },

    // 选择时间范围
    changeTime(obj = {}) {
      this.timeObj = obj
      this.getChartData()
    },

    /**
     * @description: 查询数据
     */
    async getChartData() {
      if (!this.domains.length) {
        return this.$msg.warning('请选择域名进行查询')
      }
      this.btnLoading = true

      const { range, step, unit } = this.timeObj

      this.$nextTick(() => {
        this.domains.forEach((domain, idx) => {
          this.$refs[`QpsChartRef${idx}`][0].getChart({
            domain,
            step,
            range,
            unit
          })
        })
        this.btnLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.domain-qps-box {
  min-height: calc(100vh - 250px);
}

.chart-warp {
  height: 300px;
  padding: 5px;
  background-color: theme('colors.ants-bg-3');
  .chart-item {
    height: 100%;
    overflow: hidden;
    cursor: pointer;
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
    height: 200px;
  }
}
</style>
