<template>
  <query v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import query from '@/v2/cdn_common/views/analysis/query'
export default {
  components: {
    query
  }
}
</script>
