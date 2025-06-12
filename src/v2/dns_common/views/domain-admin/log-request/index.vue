<template>
  <div>
    <QueryLog
      ref="QueryLogRef"
      hiddenDomainInput
    />
  </div>
</template>

<script>
import QueryLog from '@/v2/dns_common/views/analysis/query'

export default {
  components: {
    QueryLog
  },
  data() {
    return {}
  },
  mounted() {
    if (!this.$route.params.domain) return
    this.$refs.QueryLogRef.queryInfo.domain = this.$route.params.domain
    this.$refs.QueryLogRef.getTableData()
  },
  methods: {}
}
</script>
