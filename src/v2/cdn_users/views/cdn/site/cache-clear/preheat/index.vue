<template>
  <preheat v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import preheat from '@/v2/cdn_common/views/site-cache-clear/preheat'
export default {
  components: {
    preheat
  }
}
</script>
