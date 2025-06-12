<template>
  <basic v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import basic from '@/v2/cdn_common/views/site-admin/basic'
export default {
  components: {
    basic
  }
}
</script>
