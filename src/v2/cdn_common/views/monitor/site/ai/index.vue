<template>
  <div class="pt-lg animated fadeIn">
    <Count ref="CountRef" v-on="$listeners" />
    <TableDetail ref="TableDetailRef" v-on="$listeners"/>
  </div>
</template>

<script>
import Count from './components/Count'
import TableDetail from './components/TableDetail'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPrometheus } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

export default {
  components: {
    Count,
    TableDetail
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
