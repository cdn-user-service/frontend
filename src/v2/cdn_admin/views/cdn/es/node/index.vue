<template>
  <node v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import node from '@/v2/cdn_common/views/es/node'
export default {
  components: {
    node
  }
}
</script>
