<template>
  <businessSecure v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import businessSecure from '@/v2/cdn_common/views/site-admin/business-secure'
export default {
  components: {
    businessSecure
  }
}
</script>
