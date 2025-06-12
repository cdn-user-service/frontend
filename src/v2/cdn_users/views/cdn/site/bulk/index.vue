<template>
  <bulk v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import bulk from '@/v2/cdn_common/views/site-bulk'
export default {
  components: {
    bulk
  }
}
</script>
