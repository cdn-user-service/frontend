<template>
  <log v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import log from '@/v2/cdn_common/views/analysis/stream'
export default {
  components: {
    log
  }
}
</script>
