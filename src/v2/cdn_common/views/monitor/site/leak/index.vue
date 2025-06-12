<template>
  <div class="pt-lg animated fadeIn">
    <Count ref="CountRef" v-on="$listeners" />

    <Area ref="AreaRef" v-on="$listeners" />
  </div>
</template>

<script>
import Count from './components/Count'
import Area from './components/Area'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPrometheus } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

export default {
  components: {
    Count,
    Area
  },
  data() {
    return {}
  },
  created() {},
  methods: {
    /**
     * @description: 渲染数据及图表
     */

    renderChart() {
      this.$nextTick(async () => {
        // 查询数据
        const form = this.$listeners.getFormData()
      })
    }
  }
}
</script>
