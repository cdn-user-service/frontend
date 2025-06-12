<template>
  <div class="animated fadeIn">
    <div class="my-xl rounded-2xl px-lg border border-ants-border-2">
      <el-row :gutter="20">
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 8 }"
          :md="{ span: 8 }"
          :lg="{ span: 8 }"
          :xl="{ span: 8 }"
          v-for="(item, idx) in totalList"
          :key="idx"
        >
          <ul class="space-y-8 my-df">
            <li class="font-bold">{{ antsT(item.title) }}</li>
            <li>
              <div
                class="inline-block total-flow-box"
                v-loading="item.loading"
                element-loading-spinner="el-icon-loading"
              >
                <span class="text-5xl">{{ item.value }} </span>
                <span> {{ antsT(item.unit) }}</span>
              </div>
            </li>
            <li class="text-sm text-ants-text-4">{{ item.time }}</li>
          </ul>
        </el-col>
      </el-row>
    </div>

    <el-row
      :gutter="15"
      v-for="(item, idx) in chartList"
      :key="idx"
      class="mt-lg"
    >
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 16 }"
        :lg="{ span: 16 }"
        :xl="{ span: 16 }"
      >
        <div class="chart-warp rounded-2xl p-2 bg-ants-bg-3">
          <div
            class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full"
          >
            <LineChart
              :ref="`LineChartRef${idx}`"
              :query-data="item.queryData"
            />
          </div>
        </div>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
      >
        <TitleBorder>
          <strong class="text-sm">{{
            `TOP5 ${antsT(item.title)} ${antsT('排行')}`
          }}</strong>
        </TitleBorder>
        <el-table
          :data="item.top5"
          max-height="276"
          size="small"
          style="margin:0;"
          v-loading="item.loading"
          element-loading-spinner="el-icon-loading"
        >
          <div slot="empty">
            <el-empty
              :description="antsT('暂无数据')"
              style="transform: scale(0.8);"
            />
          </div>
          <ants-table-column :label="nameObj[nameKey]" prop="name">
          </ants-table-column>
          <ants-table-column :label="item.top5Lable">
            <template #default="{ row }">
              {{ row.value }} {{ row.unit }}
            </template>
          </ants-table-column>
        </el-table>
      </el-col>
    </el-row>

    <QpsLineChart ref="QpsLineChartRef" class="mt-lg" v-show="false"/>
  </div>
</template>
<script>
// QPS
import QpsLineChart from './qps.vue'

// 时间折线图
import LineChart from '@/v2/cdn_common/chart/line'

import { flow, bandwidth, request } from './js/line-query'
import {
  flow as streamFlow,
  bandwidth as streamBandwidth,
  request as streamRequest
} from '../stream/js/line-query'

// 导入动态计算流量，带宽
import { flowUnit, bpsUnit } from '@/utils/public'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPrometheus } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

export default {
  components: {
    QpsLineChart,
    LineChart
  },
  data() {
    return {
      totalList: [
        {
          title: '峰值带宽',
          value: '0.00',
          unit: 'Bbps',
          time: '~',
          loading: false
        },
        {
          title: '总流量',
          value: '0.00',
          unit: 'B',
          time: '~',
          loading: false
        },
        {
          title: '总请求数',
          value: 0,
          unit: '次',
          time: '~',
          loading: false
        }
      ],
      chartList: [
        {
          title: '带宽',
          queryData:
            this.$route.name === 'StreamFlow' ? streamBandwidth : bandwidth,
          top5Lable: '带宽',
          loading: false,
          top5: []
        },
        {
          title: '流量',
          queryData: this.$route.name === 'StreamFlow' ? streamFlow : flow,
          top5Lable: '总流量',
          loading: false,
          top5: []
        },
        {
          title: '请求数',
          queryData:
            this.$route.name === 'StreamFlow' ? streamRequest : request,
          top5Lable: '请求数',
          loading: false,
          top5: []
        }
      ],
      nameObj: {
        site: '域名',
        stream: '端口'
      },
      nameKey: 'site'
    }
  },
  created() {
    this.renderChart()
  },
  methods: {
    /**
     * @description: 根据数据渲染 line 图表
     */

    renderChart() {
      this.$nextTick(() => {
        // 查询数据
        const FORM = this.$listeners.getFormData()
        const { mode, host, port, start, end, step } = FORM

        if (mode == 'site' && !host.length) return
        if (mode == 'stream' && !port.length) return
        this.nameKey = mode

        const NEW_FORM = {
          ...FORM,
          // 时间范围
          TIME: Math.round(end - start),
          // 站点查询域名拼接
          HOST: host && host.map(item => JSON.parse(item).domain).join('|'),
          // 转发端口查询拼接
          PORT: port && port.map(item => JSON.parse(item).port).join('|'),
          // 站点、还是端口
          MODE: mode === 'site' ? 'host' : 'port'
        }

        // 查询总数据
        this.getTotal(NEW_FORM)

        // 查询排行数据
        this.getTop5(NEW_FORM)

        this.chartList.forEach((item, idx) => {
          this.$refs[`LineChartRef${idx}`][0].getChart(FORM)
        })

        // qps
        this.$refs.QpsLineChartRef.renderChart(FORM)
      })
    },

    /**
     * @description: 查询总数据
     * @param {*} form
     */
    async getTotal({ mode, start, end, step, TIME, HOST, PORT, MODE }) {
      // 时间范围
      const TIME_RANGE =
        this.$dayjs(start * 1000).format('YYYY-MM-DD HH:mm:ss') +
        ' ~ ' +
        this.$dayjs(end * 1000).format('YYYY-MM-DD HH:mm:ss')

      // 查询数组
      const queryArr = [
        {
          // 峰值带宽
          path: 'query_range',
          queryTime: `&start=${start}&end=${end}&step=${step}`,
          // 初始数据，避免 数据为空时不切换
          initObj: {
            value: '0.00',
            unit: 'Bbps',
            time: this.$dayjs(end * 1000).format('YYYY-MM-DD HH:mm:ss')
          },
          query: {
            // 站点查询
            site: `sum(increase(nginx_vts_server_bytes_total{direction="out",host=~"${HOST}"}[1m])) by (direction)`,
            // 转发查询
            stream: `sum(increase(nginx_sts_server_bytes_total{direction="out",port=~"${PORT}"}[1m])) by (direction)`
          },
          getValue: item => {
            let maxTime = 0
            let maxBps = 0
            item.values.forEach((e, i) => {
              // 计算峰值带宽
              if (+e[1] >= maxBps) {
                maxBps = +e[1]
                maxTime = e[0]
              }
            })
            const bpsObj = bpsUnit(+maxBps, step)
            console.log(bpsObj)
            return {
              // 峰值带宽值
              value: bpsObj.value,
              unit: bpsObj.unit,
              // 峰值带宽出现时间
              time: this.$dayjs(
                maxTime === 0 ? new Date() : maxTime * 1000
              ).format('YYYY-MM-DD HH:mm:ss')
            }
          }
        },
        {
          // 总流量
          query: {
            // 站点查询
            site: `ceil(sum(increase(nginx_vts_server_bytes_total{host=~"${HOST}"}[${TIME}s])))`,
            // 转发查询
            stream: `ceil(sum(increase(nginx_sts_server_bytes_total{port=~"${PORT}"}[${TIME}s])))`
          },
          // 初始数据，避免 数据为空时不切换
          initObj: {
            value: '0.00',
            unit: 'B'
          },
          getValue: item => {
            const totalFlow = item.value[1] || 0
            const obj = flowUnit(+totalFlow)
            return obj
          }
        },
        {
          // 总请求数
          query: {
            // 站点查询
            site: `ceil(sum(increase(nginx_vts_server_requests_total{host=~"${HOST}"}[${TIME}s])))`,
            // 转发查询
            stream: `ceil(sum(increase(nginx_sts_server_connects_total{port=~"${PORT}"}[${TIME}s])))`
          },
          // 初始数据，避免 数据为空时不切换
          initObj: {
            value: 0,
            unit: '次'
          },
          getValue: item => {
            return {
              value: item.value[1] || 0,
              unit: '次'
            }
          }
        }
      ]

      // 开始请求查询
      queryArr.forEach(async (item, idx) => {
        this.totalList[idx].loading = true

        const { data: res } = await getPrometheus({
          param: `query=${encodeURIComponent(
            item.query[mode]
          )}${item.queryTime || ''}`,
          path: `/api/v1/${item.path || 'query'}`
        })
        this.totalList[idx].loading = false
        if (!res.data) return

        let obj = item.initObj
        const chartData = JSON.parse(res.data || [])
        // 如果有数据
        if (
          chartData.data &&
          chartData.data.result &&
          chartData.data.result.length
        ) {
          // 构造数据
          obj = item.getValue(chartData.data.result[0])
        }

        this.totalList[idx].value = obj.value
        this.totalList[idx].unit = obj.unit
        this.totalList[idx].time = obj.time || TIME_RANGE
      })
    },

    /**
     * @description: 查询排行数据
     * @param {*} form
     */

    async getTop5({ mode, start, end, step, TIME, HOST, PORT, MODE }) {
      // 查询前几
      const TOP = 5
      const TIME1 = 60
      // 查询数组
      const queryArr = [
        {
          // 带宽
          query: {
            // 站点查询
            site: `ceil(topk(${TOP}, max_over_time(sum(increase(nginx_vts_server_bytes_total{direction="out",host=~"${HOST}"}[${step}s])) by (host) [${TIME}s:30s])))`,
            // 转发查询
            stream: `ceil(topk(${TOP}, max_over_time(sum(increase(nginx_sts_server_bytes_total{direction="out",port=~"${PORT}"}[${step}s])) by (port) [${TIME}s:30s])))`
          },
          getValue: item => {
            console.log(item)
            const VALUE = item.value[1] || 0
            const bandwidthObj = bpsUnit(VALUE, step)
            return {
              name: item.metric[MODE],
              value: bandwidthObj.value,
              unit: bandwidthObj.unit
            }
          }
        },
        {
          // 流量
          query: {
            // 站点查询
            site: `ceil(topk(${TOP}, sum(increase(nginx_vts_server_bytes_total{host=~"${HOST}"}[${TIME}s])) by (host)))`,
            // 转发查询
            stream: `ceil(topk(${TOP}, sum(increase(nginx_sts_server_bytes_total{port=~"${PORT}"}[${TIME}s])) by (port)))`
          },
          getValue: item => {
            const VALUE = item.value[1] || 0
            const flowObj = flowUnit(+VALUE)
            return {
              name: item.metric[MODE],
              value: flowObj.value,
              unit: flowObj.unit
            }
          }
        },
        {
          // 请求数
          query: {
            // 站点查询
            site: `ceil(topk(${TOP}, sum(increase(nginx_vts_server_requests_total{host=~"${HOST}"}[${TIME}s])) by (host)))`,
            // 转发查询
            stream: `ceil(topk(${TOP}, sum(increase(nginx_sts_server_connects_total{port=~"${HOST}"}[${TIME}s])) by (port)))`
          },
          getValue: item => {
            return {
              name: item.metric[MODE],
              value: item.value[1] || 0,
              unit: '次'
            }
          }
        }
      ]

      // 开始请求查询
      queryArr.forEach(async (item, idx) => {
        this.chartList[idx].loading = true
        const { data: res } = await getPrometheus({
          param: `query=${encodeURIComponent(item.query[mode])}`,
          path: '/api/v1/query'
        })
        this.chartList[idx].loading = false
        if (!res.data) return

        let arr = []
        const chartData = JSON.parse(res.data || [])
        // 如果有数据
        if (
          chartData.data &&
          chartData.data.result &&
          chartData.data.result.length
        ) {
          arr = chartData.data.result.map(item2 => {
            return item.getValue(item2)
          })
        }
        this.chartList[idx].top5 = arr
      })
    },

    /**
     * @description: 查询排行数据，要用到产品id, 暂时不查
     * @return {*}
     */

    async _queryTopData({ mode, host, port, start, end, step }) {
      const TARGET = this.isHostOrPort(mode, host, port)
      const query = encodeURIComponent(
        `ceil(topk(10,sum(increase(nginx_vts_server_requests_total{${TARGET}}))))`
      )

      const { data: res } = await getPrometheus({
        param: `query=${query}`,
        path: '/api/v1/query'
      })
    }
  }
}
</script>
<style lang="scss">
.total-flow-box {
  .el-loading-spinner {
    margin-top: -6px;
  }
}
</style>
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
