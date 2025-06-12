<template>
  <list v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import list from '@/v2/cdn_common/views/finance/list'
export default {
  components: {
    list
  }
}
</script>
