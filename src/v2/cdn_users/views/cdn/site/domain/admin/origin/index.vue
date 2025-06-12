<template>
  <Origin v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import Origin from '@/v2/cdn_common/views/site-admin/origin'
export default {
  components: {
    Origin
  }
}
</script>
