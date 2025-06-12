<template>
  <esStream v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import esStream from '@/v2/cdn_common/views/es/stream'
export default {
  components: {
    esStream
  }
}
</script>
