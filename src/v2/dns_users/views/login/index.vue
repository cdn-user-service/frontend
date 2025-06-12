<template>
  <el-container direction="vertical" class="bg-login-bg-color min-h-full">
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
  methods: {
    
  }
}
</script>
