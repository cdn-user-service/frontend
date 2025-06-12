<template>
  <el-container direction="vertical" class="bg-login-bg-color min-h-full">
    <Header />

    <el-main>
      <div class="table-cell align-middle">
        <div
          class="login-img-box flex items-center justify-between"
          :class="{ 'login-img-box--wechat': powerObj.wechat }"
        >
          <div
            class="ants-login-form px-lg pt-xxl sm:p-xxxl bg-white rounded-2xl overflow-hidden animated fadeInUp"
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
    return {}
  },
  computed: {
    // 后台开启了哪些登录方式
    powerObj({ $root }) {
      const {
        WXLOGIN_CONFIG_KEY: wechat,
        SMS_CONFIG_KEY: mobile,
        MAIL_CONFIG_KEY: mail
      } = $root.powerObj

      return { wechat, mobile, mail }
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
  max-width: 450px;
  margin: 0 auto;

  &--wechat {
    max-width: 850px;
  }
}
.ants-login-form {
  width: 100%;
  min-height: 400px;
}
</style>

<style lang="scss">
.ants-login-form {
  .el-button {
    padding: 15px 20px;
  }
}
</style>
