<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <div class="mb-lg">
        <TimeRange
          v-model="query.time"
          @change="toQuery"
        />
        <ants-select
          v-model="query.type"
          @change="toQuery"
          class="ml-df"
          size="small"
          style="width:150px;"
        >
          <ants-option
            v-for="(item, key) in typeObj"
            :key="key"
            :value="key"
            :label="item"
          />
        </ants-select>
      </div>

      <div class="mt-lg">
        <TitleBorder
          title="domaintest.com（次）"
          class="pb-sm"
        >
          <span class="pl-lg text-ants-text-4">
            （总解析次数：113 次）
          </span>
        </TitleBorder>
        <div style="height:400px;">
          <ants-chart-line
            ref="chartLineRef"
            :option="lineOption"
          />
        </div>
      </div>

    </el-card>
  </div>
</template>

<script>
import TimeRange from '@/v2/dns_common/views/a-monitor/real-time/TimeRange.vue'

import lineOption from './line-option.js'

const typeObj = {
  all: '全部解析类型',
  A: 'A记录',
  AAAA: 'AAAA记录',
  ADDRS: 'ADDRS记录'
}
export default {
  components: {
    TimeRange
  },
  data() {
    return {
      typeObj,
      lineOption,

      query: {
        time: '6h',
        type: 'all'
      }
    }
  },
  created() {},
  mounted() {
    this.getChart()
  },
  methods: {
    toQuery() {
        this.getChart()
    },

    getChart() {
      const timeSeries = []
      const timeSeries2 = []
      const timeSeries3 = []
      // 构造 9:00 - 15:00 时间序列，间隔 5 分钟
      for (let i = 0; i < 72; i++) {
        const time = new Date().setHours(9, 0, 0, 0) + i * 5 * 60 * 1000
        timeSeries.push([
          // 时间戳
          time,
          // 平滑的随机数 300 ~ 330
           Math.floor(Math.random() * 20 + 300)
        ])

        timeSeries2.push([
          // 时间戳
          time,
          // 平滑的随机数 200 ~ 220
          Math.floor(Math.random() * 20 + 50)
        ])

        timeSeries3.push([
          // 时间戳
          time,
          Math.floor(Math.random() * 20 + 10)
        ])
      }

      this.$refs.chartLineRef.getChart({}, [
        {
          id: 1,
          name: 'HTTP-DES',
          data: timeSeries
        },
        {
          id: 2,
          name: 'HTTP-AES',
          data: timeSeries2
        },
        {
          id: 3,
          name: 'HTTPS',
          data: timeSeries3
        }
      ])
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
