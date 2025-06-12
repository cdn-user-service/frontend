<template>
  <order v-bind="$attrs" v-on="$listeners"/>
</template>

<script>
import order from '@/v2/cdn_common/views/finance/order'
export default {
  components: {
    order
  }
}
</script>
