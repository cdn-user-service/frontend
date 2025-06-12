<template>
  <site v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import site from '@/v2/cdn_common/views/es/site'
export default {
  components: {
    site
  }
}
</script>
