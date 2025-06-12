<template>
  <el-card class="mb-lg">
    <div class="flex justify-between items-center mb-lg">
      <TitleBorder title="套餐流量情况" />
      <span
        class="cursor-color text-primary text-sm"
        @click="$router.push('/cdn/plan/own')"
        >{{ antsT('更多') }}</span
      >
    </div>

    <el-skeleton :rows="5" :loading="loading" animated>
      <template>
        <div class="text-center" v-if="!topList.length">
          <el-empty
            style="transform: scale(0.5); padding: 0; height: 100px"
            description=" "
          />
          <div class="py-sm">
            <ants-button
              type="primary"
              size="small"
              text="前往购买套餐"
              @click="$router.push('/cdn/plan/purchase')"
            />
          </div>
        </div>

        <ul v-else style="max-height: 300px" class="space-y-sm">
          <li v-for="(item, idx) in topList" :key="idx">
            <div class="text-sm text-ants-text-4 mb-xs truncate">
              {{ item.name }}
            </div>

            <FlowProgress :used="+item.used" :total="+item.total" :width="10" />
          </li>
        </ul>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script>
// API
import { getPlanSuitList } from '@/v2/cdn_users/api/cdn/plan'

import FlowProgress from '@/v2/cdn_common/components/Plan/FlowProgress'

export default {
  components: {
    FlowProgress
  },
  data() {
    return {
      loading: false,
      topList: []
    }
  },
  created() {
    this.getMyPlanList()
  },
  methods: {
    // 获取我的套餐数据
    async getMyPlanList() {
      this.loading = true
      try {
        const { data: res } = await getPlanSuitList({
          mode: 1,
          page: 1,
          limit: 50
        })

        if (res.code !== 1) return
        const baseArr = (res.data || {}).list || []
        const arr = []
        baseArr.forEach((item) => {
          const { usedTypeDetail = {}, attr = {}, consume = {} } = item
          // 过滤出流量月结套餐
          if (attr.charging_mode == '1') {
            arr.push({
              // 已使用
              used: usedTypeDetail.totalFlowGb || 0,
              // 总流量
              total: attr.flow || 0,
              // 套餐名称
              name: (item.productEntity || {}).name
            })
          }
        })
        // 排序
        const sortArr = arr.sort(this.sortPlan)
        this.topList = sortArr.slice(0, 3)
      } finally {
        this.loading = false
      }
    },

    sortPlan(x, y) {
      return y.used - x.used
    },

    /**
     * @description: 根据百分比返回颜色
     */

    autoColor(percent) {
      let color = '#177DFF'
      if (percent < 50) {
        color = '#01C879'
      }
      if (percent > 90) {
        color = '#F52443'
      }
      return color
    }
  }
}
</script>
