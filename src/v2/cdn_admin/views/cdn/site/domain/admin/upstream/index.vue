<template>
  <Upstream v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import Upstream from '@/v2/cdn_common/views/site-admin/upstream'
export default {
  components: {
    Upstream
  }
}
</script>
