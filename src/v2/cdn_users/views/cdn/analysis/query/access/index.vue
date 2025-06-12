<template>
  <access v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import access from '@/v2/cdn_common/views/analysis/query/access'
export default {
  components: {
    access
  }
}
</script>
