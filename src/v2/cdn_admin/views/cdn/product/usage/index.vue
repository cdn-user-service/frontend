<template>
  <div class="animated fadeIn">
    <el-card class="mt-lg">
      <div class="flex justify-between items-start">
        <div class="space-x-4 flex-1 flex items-center">
          <QueryTime
            ref="QueryTimeRef"
            v-model="time"
            :step.sync="step"
            @getChart="doSearch"
            v-bind="$attrs"
            v-on="$listeners"
          />

          <QueryUserSelect
            v-model="form.userId"
            :username="form.username"
            size="small"
            style="width:220px;"
          />

          <QueryPlanSelect
            style="width:220px;"
            size="small"
            :user-id="form.userId"
            v-model="form.serialNumber"
            @change="changePlan"
            isAll
          />
        </div>

        <ants-button
          size="small"
          type="primary"
          icon="el-icon-search"
          text="查询"
          :loading="$root.loading"
          @click="doSearch"
        />
      </div>

      <!-- 流量、带宽图表-->
      <UsageChart ref="UsageChartRef" :type="type" />
    </el-card>
  </div>
</template>

<script>
import QueryTime from '@/v2/cdn_common/views/plan-usage/components/QueryTime.vue'
import UsageChart from '@/v2/cdn_common/views/plan-usage/chart.vue'

import QueryUserSelect from '@/v2/cdn_admin/components/QueryUserSelect'
import QueryPlanSelect from '@/v2/cdn_admin/components/QueryPlanSelect'

export default {
  components: {
    QueryTime,
    UsageChart,
    QueryUserSelect,
    QueryPlanSelect
  },
  data() {
    return {
      type: 'flow',
      // 查询时间范围，默认 近 7 天
      time: 720,
      // 查询粒度，默认 五分钟，这里不需要粒度
      step: 300,
      // 当前选择的套餐
      form: {
        userId: '',
        serialNumber: '',
        username: ''
      }
    }
  },
  mounted() {
    const { userId, username, serialNumber } = this.$route.query
    if (serialNumber) {
      this.form.serialNumber = serialNumber
    }
    
    if (userId) {
      this.form.userId = +userId
    }

    if (username) {
      this.form.username = username
    }
  },
  methods: {
    /**
     * @description: 切换套餐
     */

    async changePlan(val) {
      this.getChart()
    },

    /**
     * @description: 点击查询
     */

    doSearch() {
      if (!this.form.serialNumber) {
        return this.$msg.error('请选择用户套餐进行查询')
      }
      this.getChart()
    },

    /**
     * @description: 绘制图表
     */

    getChart() {
      const form = this.getQueryData()
      this.$refs.UsageChartRef.renderChart(form)
    },

    /**
     * @description: 返回查询数据
     */

    getQueryData() {
      const timeValue = this.$refs.QueryTimeRef.timeValue
      return {
        // 查询时间范围
        start: timeValue[0],
        end: timeValue[1],
        // 选择的套餐
        serialNumber: this.form.serialNumber,
        // 流量还是带宽
        type: this.type,

        // 粒度跟域名暂时不需要
        // 粒度
        step: this.step,
        // 域名
        host: ['waf.test.com']
      }
    }
  }
}
</script>
