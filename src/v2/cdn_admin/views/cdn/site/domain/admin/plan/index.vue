<template>
  <plan v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import plan from '@/v2/cdn_common/views/site-admin/plan'
export default {
  components: {
    plan
  }
}
</script>
