<template>
  <error v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import error from '@/v2/cdn_common/views/analysis/query/error'
export default {
  components: {
    error
  }
}
</script>
