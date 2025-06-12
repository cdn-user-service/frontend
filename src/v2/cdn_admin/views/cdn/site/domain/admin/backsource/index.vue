<template>
  <backsource v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import backsource from '@/v2/cdn_common/views/site-admin/backsource'
export default {
  components: {
    backsource
  }
}
</script>
