<template>
  <block v-bind="$attrs" v-on="$listeners" :domain="$route.query.domain" />
</template>

<script>
import block from '@/v2/cdn_common/views/analysis/query/block'
export default {
  components: {
    block
  }
}
</script>
