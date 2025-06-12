
<template>
  <el-header
    style="background:rgba(0,0,0,.2);"
    height="auto"
    class="flex items-center px-df py-0 md:py-xs"
  >
    <div
      class="flex items-center justify-center md:justify-between container mx-auto px-lg animated fadeInDown"
    >
      <Logo style="margin-right:0;" />

      <div class="flex items-center">
        <Language style="color: #fefefe;" ref="LanguageRef">
          <span class="font-bold mr-lg whitespace-no-wrap" slot="behind">{{
            $i18n.locale === 'cn' ? '中文' : 'English'
          }}</span>
            <!-- $store.state.lang === 'cn' ? '中文' : 'English' -->
        </Language>

        <div class="flex items-center hidden-xs-only">
          <router-link
            to="/login"
            class="px-lg py-sm rounded-full font-semibold bg-white text-primary cursor"
          >
            {{ antsT('登录') }}
          </router-link>

          <router-link
            v-if="!isForbidRegister"
            to="/register"
            class="px-lg py-sm rounded-full font-semibold ml-sm bg-primary text-white text-df cursor"
            >{{ antsT('注册') }}</router-link
          >
        </div>
      </div>
    </div>
  </el-header>
</template>

<script>
export default {
  data() {
    return {}
  },
  computed: {
    // 后台是否禁用注册功能，true = 禁用
    isForbidRegister({ $root }) {
      const { register } = $root.webConfig.power

      return register === 1
    }
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
.login-path-btn {
  padding: 10px 20px;
  border-radius: 50px;
}
</style>
