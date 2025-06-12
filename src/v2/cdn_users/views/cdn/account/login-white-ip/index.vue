<template>
  <loginWhiteIp v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import loginWhiteIp from '@/v2/cdn_common/views/login-white-ip'
export default {
  components: {
    loginWhiteIp
  }
}
</script>
