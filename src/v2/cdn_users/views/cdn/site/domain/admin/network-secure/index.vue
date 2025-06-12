<template>
  <networkSecure v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import networkSecure from '@/v2/cdn_common/views/site-admin/network-secure'
export default {
  components: {
    networkSecure
  }
}
</script>
