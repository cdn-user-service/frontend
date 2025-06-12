<template>
  <div class="animated fadeIn">
    <div class="ants-tips_box mt-lg">
      <span class="el-icon-info"></span>
      {{
        antsT(
          '展示加速域名的用量数据，包括流量、带宽、请求数、查询时间、加速域名等。用量查询将帮助您了解当前CDN计费项和计量数值。'
        )
      }}
    </div>

    <el-card class="mt-lg">
      <div class="flex justify-between items-start">
        <div class="space-x-4 flex items-center">
          <QueryTime
            ref="QueryTimeRef"
            v-model="time"
            :step.sync="step"
            @getChart="getChart"
            v-bind="$attrs"
            v-on="$listeners"
          />
          <ants-select
            v-model="serialNumber"
            size="small"
            style="width:200px;"
            placeholder="请选择套餐"
            @change="changePlan"
            v-loading="$root.loading"
            element-loading-spinner="el-icon-loading"
          >
            <el-option-group
              v-for="group in planList"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                {{ item.label }}
              </el-option>
            </el-option-group>
          </ants-select>
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
// API
import { getMyPlanAll } from '@/v2/cdn_users/api/cdn/plan'

import QueryTime from '@/v2/cdn_common/views/plan-usage/components/QueryTime.vue'
import UsageChart from '@/v2/cdn_common/views/plan-usage/chart.vue'

export default {
  components: {
    QueryTime,
    UsageChart
  },
  data() {
    return {
      type: 'flow',
      // 查询时间范围，默认 近 一个月
      time: 720,
      // 查询粒度，默认 5秒
      step: 60,
      // 当前选择的套餐
      serialNumber: '',
      planList: []
    }
  },
  mounted() {
    this.getPlanList()
  },
  methods: {
    /**
     * @description: 查询已有套餐数据
     */

    async getPlanList() {
      this.$root.loading = true
      try {
        const { data: res } = await getMyPlanAll({
          // 查询用户所有的套餐，包括已过期套餐
          all: 1
        })
        if (res.code !== 1) return

        const keys = []
        const vals = []
        res.data.forEach(item => {
          const {
            serial_number: value,
            productName: label,
            statusMsg = '其他'
          } = item
          const idx = keys.indexOf(statusMsg)

          if (idx === -1) {
            keys.push(statusMsg)
            vals.push({
              label: statusMsg,
              options: [
                {
                  label,
                  value
                }
              ]
            })
            return
          }
          vals[idx].options.push({
            label,
            value
          })
        })

        const sortArr = [
          '正常启用',
          '已升级',
          '已用完',
          '已过期',
          '被禁用',
          '被注销',
          '已清算',
          '不可用',
          '其他'
        ]

        this.planList = vals.sort((a, b) => {
          // 重新排序：正常启用 | 已升级 | 已用完 | 已过期 | 被禁用 | 被注销 | 已清算 | 不可用 | 其他
          const idxA = sortArr.indexOf(a.label)
          const idxB = sortArr.indexOf(b.label)
          if (idxA === -1 || idxB === -1) return 0
          return idxA - idxB
        })
        if (!vals.length) {
          return this.$msg.error('暂无可查询套餐')
        }
        // 如果有套餐则自动查询数据
        if (vals.length > 0) {
          this.serialNumber =
            this.$route.query.serialNumber || this.planList[0].options[0].value
          this.getChart()
        }
      } finally {
        this.$root.loading = false
      }
    },

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
      this.getChart()
    },

    /**
     * @description: 绘制图表
     */

    getChart() {
      if (!this.serialNumber) return this.$msg.error('请选择套餐进行查询')
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
        serialNumber: this.serialNumber,
        // 流量还是带宽
        type: this.type,

        // 粒度跟域名暂时不需要
        // 粒度
        step: this.step,
        // 域名
        host: ['waf.test.com']
      }
    },

    /**
     * @description: 切换类型
     */

    changeType(val) {
      this.getChart()
    }
  }
}
</script>
