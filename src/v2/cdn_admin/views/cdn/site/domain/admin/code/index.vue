<template>
  <Code v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import Code from '@/v2/cdn_common/views/site-admin/code'
export default {
  components: {
    Code
  }
}
</script>
