<template>
  <div>
    <AuthCard ref="AuthCardRef" />
    <VersionCard ref="VersionCardRef" />
  </div>
</template>

<script>
import AuthCard from './components/AuthCard/index.vue'
import VersionCard from './components/VersionCard/index.vue'
export default {
  components: {
    AuthCard,
    VersionCard
  },
  data() {
    return {}
  },
  created() {},
  methods: {}
}
</script>
