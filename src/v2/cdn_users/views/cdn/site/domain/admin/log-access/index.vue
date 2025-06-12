<template>
  <access v-bind="$attrs" v-on="$listeners" :domain="$route.query.domain" />
</template>

<script>
import access from '@/v2/cdn_common/views/analysis/query/access'

export default {
  components: {
    access
  }
}
</script>
