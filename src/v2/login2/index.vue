<template>
  <Banner>
    <transition
      name="fade-transform"
      mode="out-in"
    >
      <router-view />
    </transition>
  </Banner>
</template>

<script>
import Banner from './Banner'
export default {
  components: {
    Banner
  }
}
</script>
