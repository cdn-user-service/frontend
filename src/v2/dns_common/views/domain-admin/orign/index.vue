<template>
  <OrignMap :domain="domain" />
</template>

<script>
import OrignMap from '@/v2/dns_common/views/analysis/chart/orign'
export default {
  components: {
    OrignMap
  },
  data() {
    return {
      domain: this.$route.params.domain
    }
  },
  mounted() {},
  methods: {}
}
</script>
