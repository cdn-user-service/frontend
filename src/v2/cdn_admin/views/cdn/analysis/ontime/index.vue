<template>
  <ontime v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import ontime from '@/v2/cdn_common/views/analysis/ontime/admin'
export default {
  components: {
    ontime
  }
}
</script>
