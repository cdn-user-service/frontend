<template>
  <el-container direction="vertical" class="bg-ants-bg-2 min-h-full">
    <Header />
    <Main />
    <Footer />
  </el-container>
</template>

<script>
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'
export default {
  components: {
    Header,
    Main,
    Footer
  },
  data() {
    return {}
  },
  created() {},
  methods: {}
}
</script>

<style lang="scss">
.payment-main {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
