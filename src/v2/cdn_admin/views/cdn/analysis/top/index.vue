<template>
  <top v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import top from '@/v2/cdn_common/views/analysis/top'
export default {
  components: {
    top
  }
}
</script>
