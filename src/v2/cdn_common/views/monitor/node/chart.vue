<template>
  <el-row :gutter="10" class="animated fadeIn">
    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 12 }"
      :md="{ span: 12 }"
      :lg="{ span: 12 }"
      :xl="{ span: 12 }"
      v-for="(item, idx) in nodeList"
      :key="item + idx"
    >
      <div class="chart-warp mt-lg rounded-2xl p-2 bg-ants-bg-3">
        <el-row
          class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full"
        >
          <el-col :span="isShowRoseChart ? 18 : 24" class="h-full">
            <div class="w-full h-full">
              <LineChart
                :ref="`LineChartRef${idx}`"
                :query-data="queryData"
                :title="item"
              />
            </div>
          </el-col>
          <el-col :span="6" class="h-full" v-if="isShowRoseChart">
            <div class="rose-chart w-full">
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
</template>
<script>
// 时间折线图
import LineQuery from './js/line-query'
import LineChart from '@/v2/cdn_common/chart/line'

// 饼图
import RoseChart from '@/v2/cdn_common/chart/rose'
import RoseQuery from './js/rose-query'

export default {
  components: {
    LineChart,
    RoseChart
  },
  data() {
    return {
      queryData: {},
      queryDataRose: {},
      nodeList: []
    }
  },
  watch: {
    // 监听路由地址的改变
    '$route.path': function(newPath, oldPath) {
      this.setQueryData(newPath)
      this.renderChart()
    }
  },
  computed: {
    isShowRoseChart({ $route }) {
      const ROUTE_PATH = $route.path.replace('/cdn/node/monitor/', '')
      if (ROUTE_PATH === 'disk' || ROUTE_PATH === 'memory') return true
      return false
    }
  },
  created() {
    this.setQueryData(this.$route.path)
  },
  methods: {
    /**
     * @description: 设置当前页面请求数据
     */

    setQueryData(fullPath = '') {
      const path = fullPath.replace('/cdn/node/monitor/', '')

      this.queryData = LineQuery[path] || {}

      // 饼图查询数据
      if (this.isShowRoseChart) {
        this.queryDataRose = RoseQuery[path] || []
      }
    },

    /**
     * @description: 根据数据渲染 line 图表
     */

    renderChart() {
      this.$nextTick(() => {
        const form = this.$listeners.getFormData()
        this.nodeList = form.node || []

        // 初始化请求的时候，dom 还没有渲染好，获取不到，设置一个定时器，等待DOM渲染成功
        setTimeout(() => {
          form.node.forEach((item, idx) => {
            const queryForm = {
              ...form,
              host: item
            }
            // 获取饼图数据
            if (this.isShowRoseChart) {
              this.$refs[`RoseChartRef${idx}`][0].getChart(queryForm)
            }
            this.$refs[`LineChartRef${idx}`][0].getChart(queryForm)
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
  .chart-item {
    transition: all 0.3s;
    &:hover {
      box-shadow: 0px 0px 15px 1px rgba(23, 125, 255, 0.2);
    }
  }

  .rose-chart {
    // width: 200px;
    height: 100%;
  }
  @media screen and (max-width: 991px) {
    height: 250px;
  }

  @media screen and (max-width: 767px) {
    height: 220px;
    .rose-chart {
      // width: 100px;
    }
  }
}
</style>
