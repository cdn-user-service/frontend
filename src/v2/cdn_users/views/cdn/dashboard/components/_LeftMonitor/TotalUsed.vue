<template>
  <div class="mt-lg">
    <!-- <TitleBorder title="站点用量概览" /> -->

    <el-row :gutter="20" class="my-lg">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
        v-for="(item, idx) in totalList"
        :key="idx"
      >
        <div
          class="rounded-2xl bg-ants-bg-3 total-used-item"
          v-loading="item.loading"
          element-loading-spinner="el-icon-loading"
        >
          <ul class="bg-ants-bg-2 rounded-2xl p-lg cursor-pointer">
            <li class="font-semibold text-sm">{{ antsT(item.title) }}</li>
            <li class="my-df">
              <span class="text-3xl mr-sm" :class="item.color">{{ item.value }}</span>
              <span class="text-sm">{{ antsT(item.unit) }}</span>
            </li>
            <li class="text-sm text-ants-text-4">{{ item.time }}</li>
          </ul>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// API
import { getPrometheus } from '@/v2/cdn_users/api/cdn/monitor'
// 导入动态计算流量，带宽
import { flowUnit, bpsUnit } from '@/utils/public'

export default {
  data() {
    return {
      totalList: [
        {
          title: '峰值带宽',
          value: '0.00',
          unit: 'Bbps',
          time: '~',
          loading: false,
          color: 'text-primary'
        },
        {
          title: '总流量',
          value: '0.00',
          unit: 'B',
          time: '~',
          loading: false,
          color: 'text-success'
        },
        {
          title: '总请求数',
          value: 0,
          unit: '次',
          time: '~',
          loading: false,
          color: 'text-warning'
        }
      ]
    }
  },
  methods: {
    /**
     * @description: 渲染数据
     */    
    renderChart(form = {}) {
      // 查询数据开始
      this.getTotal(form)
    },

    /**
     * @description: 查询总数据
     * @param {*} form
     */
    async getTotal({ host, start, end, step }) {
      // 时间范围
      const TIME = Math.round(end - start)
      // 站点查询域名拼接
      const HOST = host && host.join('|')
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
          query: `sum(increase(nginx_vts_server_bytes_total{direction="out",host=~"${HOST}"}[1m])) by (direction)`,
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
          query: `ceil(sum(increase(nginx_vts_server_bytes_total{host=~"${HOST}"}[${TIME}s])))`,
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
          query: `ceil(sum(increase(nginx_vts_server_requests_total{host=~"${HOST}"}[${TIME}s])))`,
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
            item.query
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
    }
  }
}
</script>

<style lang="scss" scoped>
.total-used-item {
  transition: all 0.3s;
  &:hover {
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.1);
  }
}
</style>
