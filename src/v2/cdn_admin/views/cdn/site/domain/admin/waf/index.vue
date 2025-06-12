<template>
  <waf v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import waf from '@/v2/cdn_common/views/site-admin/waf'
export default {
  components: {
    waf
  }
}
</script>
