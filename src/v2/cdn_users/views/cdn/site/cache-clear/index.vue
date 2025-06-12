<template>
  <cacheClear v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import cacheClear from '@/v2/cdn_common/views/site-cache-clear'
export default {
  components: {
    cacheClear
  }
}
</script>
