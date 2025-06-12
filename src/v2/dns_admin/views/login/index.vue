<template>
  <el-container direction="vertical" class="bg-login-bg-color min-h-full">
    <Header />
    <Main />
    <Footer />
  </el-container>
</template>

<script>
import Header from './Header'
import Main from './Main'
import Footer from './Footer'

export default {
  components: {
    Header,
    Main,
    Footer
  },
  data() {
    return {}
  },
  methods: {}
}
</script>
