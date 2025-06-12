<template>
  <advanced v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import advanced from '@/v2/cdn_common/views/site-admin/advanced'
export default {
  components: {
    advanced
  }
}
</script>
