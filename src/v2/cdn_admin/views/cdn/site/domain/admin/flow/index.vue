<template>
  <Flow v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import Flow from '@/v2/cdn_common/views/site-admin/flow'
export default {
  components: {
    Flow
  }
}
</script>
