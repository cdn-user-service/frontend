<template>
  <applicationSecure v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import applicationSecure from '@/v2/cdn_common/views/site-admin/application-secure'
export default {
  components: {
    applicationSecure
  }
}
</script>
