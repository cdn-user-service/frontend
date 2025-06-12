<template>
  <div class="mb-lg">
    <el-card>
      <div class="flex items-center justify-between">
        <QueryTime
          ref="QueryTimeRef"
          v-model="time"
          :step.sync="step"
          @getChart="getChart"
          v-bind="$attrs"
          v-on="$listeners"
        />
        <span
          class="refresh-span cursor-color  inline-block rounded-xl p-xs bg-ants-bg-3 el-icon-refresh text-2xl text-ants-text-4"
          @click="getChart"
        >
        </span>
      </div>

      <TotalUsed ref="TotalUsedRef" />

      <div class="flex items-center justify-between mb-lg">
        <ants-radio-group v-model="type" size="small" @change="changeType">
          <ants-radio-button
            v-for="(item, key) in typeObj"
            :key="key"
            :label="key"
            :text="item"
          />
        </ants-radio-group>
        <span
          class="text-primary cursor-pointer text-sm"
          @click="$router.push('/cdn/site/monitor/flow')"
          >{{ antsT('查看详情') }}</span
        >
      </div>

      <FlowChart
        ref="FlowChartRef"
        :type="type"
        :type-name="typeObj[type]"
        v-if="isHost"
      />
      <el-empty description="没有任何域名" v-else></el-empty>
    </el-card>
  </div>
</template>

<script>
// API
import { getSiteList } from '@/v2/cdn_users/api/cdn/site'

import QueryTime from './QueryTime'
import TotalUsed from './TotalUsed'
import FlowChart from './FlowChart'

export default {
  components: {
    QueryTime,
    TotalUsed,
    FlowChart
  },
  data() {
    return {
      loading: false,
      isHost: true,
      // 查询时间范围，默认 近 1 小时
      time: 24,
      // 查询粒度，默认 60秒
      step: 60,
      // 域名
      hostArr: [],

      type: 'flow',
      typeObj: {
        flow: '流量',
        bandwidth: '带宽',
        request: '请求数'
      }
    }
  },
  created() {},
  mounted() {
    this.getDomainList()
  },
  methods: {
    /**
     * @description: 获取域名数据
     */

    async getDomainList() {
      this.loading = true
      const { data: res } = await getSiteList({
        page: 1,
        limit: 50
      })
      this.loading = false
      if (res.code !== 1) return
      const arr = (res.data || {}).list || []
      if (!arr.length) {
        this.isHost = false
        return
      }
      this.hostArr = arr.map(item => item.mainServerName)
      this.getChart()
    },

    /**
     * @description: 绘制图表
     */

    getChart() {
      // 如果没有域名
      if (!this.isHost) return

      const form = this.getQueryData()
      console.log(form)
      this.$refs.TotalUsedRef.renderChart(form)
      this.$refs.FlowChartRef.renderChart(form)
    },

    /**
     * @description: 返回查询数据
     */

    getQueryData() {
      const timeValue = this.$refs.QueryTimeRef.timeValue
      return {
        // 查询时间范围
        start: timeValue[0] / 1000,
        end: timeValue[1] / 1000,
        // 粒度
        step: this.step,
        // 域名
        host: this.hostArr,
        // 类型 flow = 流量、bandwidth = 带宽、request = 请求数
        type: this.type
      }
    },

    /**
     * @description: 切换类型
     */

    changeType(val) {
      if (!this.isHost) return
      const form = this.getQueryData()
      this.$refs.FlowChartRef.renderChart(form)
    }
  }
}
</script>

<style lang="scss" scoped>
.refresh-span {
  transition: all 0.3s;
  &:hover {
    // box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.1);
    // .el-icon-refresh {
    //     transform: rotateZ(180deg);
    // }
  }
}
</style>
