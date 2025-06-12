<template>
  <node v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import node from '@/v2/cdn_common/views/analysis/node'
export default {
  components: {
    node
  }
}
</script>
