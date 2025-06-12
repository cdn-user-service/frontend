<template>
  <contentSecure v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import contentSecure from '@/v2/cdn_common/views/site-admin/content-secure'
export default {
  components: {
    contentSecure
  }
}
</script>
