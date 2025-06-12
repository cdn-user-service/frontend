<template>
  <SiteAdmin v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import SiteAdmin from '@/v2/cdn_common/views/site-admin'
export default {
  components: {
    SiteAdmin
  }
}
</script>
