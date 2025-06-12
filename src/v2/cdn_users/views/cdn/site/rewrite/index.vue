<template>
  <rewrite v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import rewrite from '@/v2/cdn_common/views/site-url-forwarding'
export default {
  components: {
    rewrite
  }
}
</script>
