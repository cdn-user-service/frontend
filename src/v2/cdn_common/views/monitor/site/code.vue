<template>
  <div class="animated fadeIn">
    <div class="my-xl rounded-2xl px-lg border border-ants-border-3">
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
              <span class="text-5xl" :class="'text-' + item.color"
                >{{ item.value }}
              </span>
              <span> {{ item.unit }}</span>
            </li>
          </ul>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" class="mt-lg">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <div class="chart-warp rose-chart rounded-2xl p-2 bg-ants-bg-3">
          <div
            class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full"
          >
            <RoseChart
              ref="RoseChartRef"
              :query-data="roseQueryData"
            />
          </div>
        </div>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <TitleBorder>
          <strong class="text-sm">{{antsT('状态码占比排行')}}</strong>
        </TitleBorder>
        <el-table :data="codeTop" size="small" style="margin-top:10px;">
          <ants-table-column label="状态码" prop="name"> </ants-table-column>
          <ants-table-column label="请求数">
            <template #default="{ row }"> {{ row.value }} 次 </template>
          </ants-table-column>
          <ants-table-column label="占比">
            <template #default="{ row }">
              {{
                (
                  (row.value / (totalList[0].value == 0 ? 1 : totalList[0].value)) *
                  100
                ).toFixed(2)
              }}%
            </template>
          </ants-table-column>
        </el-table>
      </el-col>
    </el-row>

    <div
      class="chart-warp rounded-2xl p-2 bg-ants-bg-3 mt-lg"
      v-for="(item, idx) in chartList"
      :key="idx"
    >
      <div class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full w-full">
        <LineChart
          :ref="`LineChartRef${idx}`"
          :title="item.title"
          :query-data="item.queryData"
        />
      </div>
    </div>
  </div>
</template>
<script>
// 时间折线图
import LineChart from '@/v2/cdn_common/chart/line'
// rose 图
import RoseChart from '@/v2/cdn_common/chart/rose'

// 站点监控
import { code, cachehits } from './js/line-query'
import { code as roseCode } from './js/rose-query'

// 转发端口监控
import { code as streamCode } from '../stream/js/line-query'
import { code as streamRoseCode } from '../stream/js/rose-query'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPrometheus } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

export default {
  components: {
    RoseChart,
    LineChart
  },
  data() {
    return {
      totalList: [
        {
          title: '状态码总数',
          value: 0,
          color: 'primary'
        },
        {
          title: '错误码总数',
          value: 0,
          color: 'info'
        },
        {
          title: '错误率',
          value: 0,
          color: 'warning',
          unit: '%'
        }
      ],
      codeTop: [],
      roseQueryData:
        this.$route.name === 'StreamCode' ? streamRoseCode : roseCode,

      chartList:
        this.$route.name === 'StreamCode'
          ? [
              {
                title: '状态码趋势',
                queryData: streamCode
              }
            ]
          : [
              {
                title: '状态码趋势',
                queryData: code
              },
              // 转发端口统计没有请求命中率
              {
                title: '请求命中率',
                queryData: cachehits
              }
            ]
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
      this.$nextTick(async () => {
        // 查询数据
        const form = this.$listeners.getFormData()
        if (form.mode == 'site' && !form.host.length) return
        if (form.mode == 'stream' && !form.port.length) return

        this.chartList.forEach((item, idx) => {
          this.$refs[`LineChartRef${idx}`][0].getChart(form)
        })

        // 饼图
        const {
          seriesData,
          totalData
        } = await this.$refs.RoseChartRef.getChart(form)
        console.log(seriesData, totalData)
        this.codeTop = seriesData || []
        this.totalList[0].value = totalData || 0
        // 错误状态码， 包含 4xx, 5xx
        let errorCode = 0
        seriesData.forEach(item => {
          if (item.name == '4xx' || item.name == '5xx') {
            errorCode += +item.value
          }
        })

        this.totalList[1].value = errorCode
        this.totalList[2].value = (
          (errorCode / (!totalData ? 1 : totalData)) *
          100
        ).toFixed(2)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-warp {
  height: 350px;
  &.rose-chart {
    height: 400px;
  }
  .chart-item {
    transition: all 0.3s;
    &:hover {
      box-shadow: 0px 0px 15px 1px rgba(23, 125, 255, 0.2);
    }
  }
  @media screen and (max-width: 991px) {
    height: 250px;
    &.rose-chart {
      height: 350px;
    }
  }

  @media screen and (max-width: 767px) {
    height: 200px;
    &.rose-chart {
      height: 300px;
    }
  }
}
</style>
