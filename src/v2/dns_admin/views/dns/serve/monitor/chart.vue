<template>
  <div class="monitor-box">
    <QueryForm ref="QueryFormRef" />

    <div v-loading="$root.loading">
      <el-empty v-if="!hostArr.length" description="未查询到数据"> </el-empty>

      <el-row v-else :gutter="20">
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 12 }"
          :md="{ span: 12 }"
          :lg="{ span: 12 }"
          :xl="{ span: 12 }"
          v-for="(item, idx) in hostArr"
          :key="item.ip + idx"
        >
          <div class="chart-warp mb-lg rounded-2xl">
            <el-row
              class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full"
            >
              <el-col :span="isShowRoseChart ? 18 : 24" class="h-full">
                <div class="w-full h-full">
                  <LineChart
                    :ref="`LineChartRef${idx}`"
                    :title="item.ip"
                    :query-data="queryData"
                  />
                </div>
              </el-col>
              <el-col :span="6" class="h-full" v-if="isShowRoseChart">
                <div class="rose-chart w-full h-full">
                  <RoseChart
                    :ref="`RoseChartRef${idx}`"
                    :query-data="queryDataRose"
                    :option="{
                      series: [
                        {
                          label: {
                            show: false
                          }
                        }
                      ]
                    }"
                  />
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import QueryForm from './components/QueryForm'
import LineChart from './components/Line'
import RoseChart from './components/Rose'

import lineQueryObj from './js/line-query'
import roseQueryObj from './js/rose-query'

export default {
  components: {
    QueryForm,
    LineChart,
    RoseChart
  },
  props: {
    dnsClientArr: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      queryData: lineQueryObj[this.$route.name.toLowerCase()],
      queryDataRose: roseQueryObj[this.$route.name.toLowerCase()]
    }
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.name': function(newVal, oldVal) {
      this.queryData = lineQueryObj[newVal.toLowerCase()]
      this.queryDataRose = roseQueryObj[newVal.toLowerCase()]

      this.getTimeLineChart(this.dnsClientArr)
    }
  },
  computed: {
    hostArr() {
      return this.dnsClientArr
    },

    isShowRoseChart({ $route }) {
      const ROUTE_NAME = $route.name.toLowerCase()
      return ROUTE_NAME === 'disk' || ROUTE_NAME === 'memory'
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * @description: 开始请求数据
     * @param {*} hostArr
     */

    getTimeLineChart(hostArr) {
      if (!hostArr) {
        hostArr = this.dnsClientArr
      }
      const screenForm = this.$refs.QueryFormRef.screenForm
      const form = {
        start: screenForm.timeValue[0] / 1000,
        end: screenForm.timeValue[1] / 1000,
        step: screenForm.step,
        host: '',
        requestType: 'udp' // 主机
      }

      this.$nextTick(() => {
        setTimeout(() => {
          hostArr.forEach((item, idx) => {
            form.host = item.ip
            this.$refs[`LineChartRef${idx}`][0].getChart(form)

            // 获取饼图数据
            if (this.isShowRoseChart) {
              this.$refs[`RoseChartRef${idx}`][0].getChart(form)
            }
          })
        }, 100)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
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
