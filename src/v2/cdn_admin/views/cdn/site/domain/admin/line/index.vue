<template>
  <Lines v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import Line from '@/v2/cdn_common/views/site-admin/line'
export default {
  components: {
    Lines: Line
  }
}
</script>
