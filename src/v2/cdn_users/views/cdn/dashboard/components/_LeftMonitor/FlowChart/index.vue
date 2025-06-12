<template>
  <div>
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 16 }"
        :lg="{ span: 16 }"
        :xl="{ span: 16 }"
      >
        <div style="height:400px;">
          <LineChart
            ref="LineChartRef"
            :query-data="queryData"
            :option="option"
          />
        </div>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
      >
        <div
          class="h-full"
          v-loading="topLoading"
          element-loading-spinner="el-icon-loading"
          style="min-height:200px;"
        >
          <ul class="border-t border-l border-r border-ants-border-4 text-sm">
            <li
              class="flex items-center py-sm px-sm border-b border-ants-border-4"
            >
              <div class="flex-1 font-bold">TOP 10 {{antsT('域名')}} </div>
              <div class="font-bold pl-sm" style="width:100px;">{{antsT(typeName)}}</div>
            </li>
            <li
              class="flex items-center py-sm px-sm border-b border-ants-border-4"
              v-for="item in top10HostList"
              :key="item.host"
            >
              <div class="flex-1">{{ item.host }}</div>
              <div class="pl-sm" style="width:100px;">
                {{ item.value }} {{ item.unit }}
              </div>
            </li>
          </ul>
        </div>

        <!-- <el-table
          size="small"
          border
          max-height="300"
          :data="top10HostList"
          style="margin:0;"
        >
          <ants-table-column prop="domain" label="TOP 10 域名" width="180">
          </ants-table-column>
          <ants-table-column prop="value" label="流量" min-width="120">
            <template #default="{ row }">
              {{ row.value }} {{ row.unit }}
            </template>
          </ants-table-column>
        </el-table> -->
      </el-col>
    </el-row>
  </div>
</template>

<script>
// API
import { getPrometheus } from '@/v2/cdn_users/api/cdn/monitor'
// 导入动态计算流量，带宽
import { flowUnit, bpsUnit } from '@/utils/public'

// 导入 option
import option from './option.js'
// 查询数据
import { flow, bandwidth, request } from './query'

// 图表组件
import LineChart from '@/v2/cdn_common/chart/line'

export default {
  components: {
    LineChart
  },
  props: {
    // 查询类型
    type: {
      type: String,
      default: 'flow'
    },
    typeName: {
      type: String,
      default: '流量'
    }
  },
  data() {
    return {
      option,
      topLoading: false,
      top10HostList: []
    }
  },
  computed: {
    queryData() {
      let obj = flow
      if (this.type === 'bandwidth') {
        obj = bandwidth
      }
      if (this.type === 'request') {
        obj = request
      }
      return obj
    }
  },
  mounted() {},
  methods: {
    /**
     * @description: 根据数据渲染 line 图表
     */
    renderChart(form = {}) {
      this.$nextTick(() => {
        // 查询数据
        // const form = this.$listeners.getFormData()
        if (!form.host.length) return

        this.$refs.LineChartRef.getChart(form)

        this.getTop10(form)
      })
    },

    async getTop10(form = {}) {
      this.topLoading = true
      const { start, end, step, host } = form
      const TYPE = this.type
      const HOST = host.join('|')
      const TIME = Math.round(end - start)

      const queryObj = {
        flow: {
          query: `ceil(topk(10, sum(increase(nginx_vts_server_bytes_total{host=~"${HOST}"}[${TIME}s])) by (host)))`,
          getValue: (item) => {
            const VALUE = item.value[1] || 0
            const flowObj = flowUnit(+VALUE)
            return {
              host: item.metric.host,
              value: flowObj.value,
              unit: flowObj.unit
            }
          }
        },
        bandwidth: {
          query: `ceil(topk(10, max_over_time(sum(increase(nginx_vts_server_bytes_total{direction="out",host=~"${HOST}"}[${step}s])) by (host) [${TIME}s:30s])))`,
          getValue: (item) => {
            const VALUE = item.value[1] || 0
            const bandwidthObj = bpsUnit(VALUE, step)
            return {
              host: item.metric.host,
              value: bandwidthObj.value,
              unit: bandwidthObj.unit
            }
          }
        },
        request: {
          query: `ceil(topk(10, sum(increase(nginx_vts_server_requests_total{host=~"${HOST}"}[${TIME}s])) by (host)))`,
          getValue: (item) => {
            return {
              host: item.metric.host,
              value: item.value[1] || 0,
              unit: '次'
            }
          }
        }
      }

      const { data: res } = await getPrometheus({
        param: `query=${encodeURIComponent(queryObj[TYPE].query)}`,
        path: '/api/v1/query'
      })
      this.topLoading = false
      if (!res.data) return
      let arr = []
      const chartData = JSON.parse(res.data || [])
      // 如果有数据
      if (
        chartData.data &&
        chartData.data.result &&
        chartData.data.result.length
      ) {
        arr = chartData.data.result.map(item => {
          return queryObj[TYPE].getValue(item)
        })
      }

      this.top10HostList = arr
    }
  }
}
</script>
