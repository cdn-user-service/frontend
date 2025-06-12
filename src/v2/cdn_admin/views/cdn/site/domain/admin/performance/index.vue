<template>
  <performance v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import performance from '@/v2/cdn_common/views/site-admin/performance'
export default {
  components: {
    performance
  }
}
</script>
