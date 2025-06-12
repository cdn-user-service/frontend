<template>
  <certificate v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import certificate from '@/v2/cdn_common/views/site-certificate'
export default {
  components: {
    certificate
  }
}
</script>
