<template>
  <Clear v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import Clear from '@/v2/cdn_common/views/site-cache-clear/clear'
export default {
  components: {
    Clear
  }
}
</script>
