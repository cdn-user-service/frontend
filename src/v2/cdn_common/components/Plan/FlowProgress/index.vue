<template>
  <div>
    <el-progress
      :percentage="percentage"
      :color="colors()"
      :text-inside="false"
      :show-text="false"
      :stroke-width="width"
      :type="type"
    />
    <div class="flex items-center justify-between text-xs mt-1">
      <!-- :style="{ color: colors() }" -->
      <span>{{ showUsed }}/{{ showTotal }}</span>
      <span class="font-semibold">{{ showPercent }}%</span>
    </div>
  </div>
</template>

<script>
import { STEP, diskUnit } from '@/utils/unit'

export default {
  props: {
    // 总流量
    total: {
      type: Number,
      default: 1
    },
    // 已使用
    used: {
      type: Number,
      default: 0
    },

    // 进度条类型 line、circle、dashboard
    type: {
      type: String,
      default: 'line'
    },
    // 进度条宽度
    width: {
      type: Number,
      default: 8
    }
  },
  computed: {
    /**
     * @description: 计算百分比
     * 已使用流量：以 GB 为单位
     * 总流量：以 GB 为单位
     */
    percentage() {
      let total = this.total
      if (!this.total) total = 1
      return Math.ceil((this.used / total) * 10000) / 100
    },

    showPercent() {
      return this.percentage > 0 && this.percentage < 0.01
        ? '<0.01'
        : this.percentage
    },

    // 总流量：默认以 GB 为单位
    showTotal() {
      const val = this.total || 0
      const { label } = diskUnit(val * Math.pow(STEP, 3))
      return label
    },

    // 已使用流量：默认以 GB 为单位，显示最小以 MB 为单位
    showUsed() {
      const val = this.used || 0
      if (val == 0) return val + 'GB'

      // 如果小于MB以MB显示
      if (val * STEP < 1) return '0.01MB'

      const { label } = diskUnit(val * Math.pow(STEP, 3))
      return label
    }
  },
  data() {
    return {}
  },
  methods: {
    /**
     * @description: 根据百分比返回颜色
     * @return {*}
     */

    colors() {
      const percent = this.percentage
      let color = '#177DFF'
      if (percent < 30) {
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
