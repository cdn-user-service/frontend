<template>
  <force ref="forceRef" :loading="loading" admin />
</template>

<script>
import force from '@/v2/cdn_common/views/site-force'
// API
import { getGlobalAttrDetail } from '@/v2/cdn_admin/api/cdn/global'

export default {
  components: {
    force
  },
  data() {
    return {
      loading: false
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      this.loading = true
      try {
        const { data: res } = await getGlobalAttrDetail({
          key: 'dns_rewrite_conf'
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        const pvalue = JSON.parse(obj.pvalue || '{}')
        console.log('pvalue', pvalue)
        if (!pvalue.dnsAddress) return 
        this.$refs.forceRef.init({
          ...pvalue
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
