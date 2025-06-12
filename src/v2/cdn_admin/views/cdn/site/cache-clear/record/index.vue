<template>
  <record v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import record from '@/v2/cdn_common/views/site-cache-clear/record'
export default {
  components: {
    record
  }
}
</script>
