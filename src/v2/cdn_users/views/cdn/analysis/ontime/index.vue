<template>
  <access v-bind="$attrs" v-on="$listeners" hide-time />
</template>

<script>
import access from '@/v2/cdn_common/views/analysis/ontime/user'
export default {
  components: {
    access
  }
}
</script>
