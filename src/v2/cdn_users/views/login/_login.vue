<template>
  <el-container direction="vertical" class="bg-login-bg-color min-h-full">
    <Header />
    <el-main>
      <div class="table-cell align-middle">
        <div class="login-img-box flex items-center justify-between">
          <div class="left-img-box pr-lg flex-1 hidden-sm-and-down animated fadeInUp">
            <!-- target="_blank" -->
            <!-- <div :href="loginImg.href" > -->
              <el-image :src="loginImg.src" alt="CDN"></el-image>
            <!-- </div> -->
          </div>

          <div
            class="ants-login-form px-lg py-xxl sm:p-xxxl bg-white rounded-2xl overflow-hidden animated fadeInUp"
          >
            <router-view></router-view>
          </div>
        </div>
      </div>
    </el-main>
    <Footer />
  </el-container>
</template>

<script>
import Header from './components/Header'
import Footer from './components/Footer'

export default {
  components: {
    Header,
    Footer
  },
  data() {
    return {
      loginImg: {
        href: 'javascript:;',
        src: require('@/assets/img/login-img_19.png')
      }
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.el-main {
  display: table;
}
.login-img-box {
  max-width: 1280px;
  margin: 0 auto;
  .left-img-box {
    width: 100%;
    > a {
      display: inline-block;
      width: 100%;
    }
  }
  @media screen and (max-width: 992px) {
    justify-content: center;
  }
}
.ants-login-form {
  width: 450px;
  .el-button {
    padding: 15px 20px;
  }
  @media screen and (max-width: 600px) {
    width: 100%;
  }
}
</style>

<style lang="scss">
.ants-login-form {
  .el-button {
    padding: 15px 20px;
  }
}
</style>
