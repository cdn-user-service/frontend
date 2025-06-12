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

      <div class="login-lang-box">
        <!-- <span class="text-primary hidden-xs-only"
            >{{ antsT('欢迎登录') }} {{ $root.webName }}
            {{ antsT('业务管理系统') }}</span
          > -->

        <!-- // $store.state.lang === 'cn' ? '中文' : 'English' -->
        <Language style="color: #fefefe;" ref="LanguageRef">
          <span class="font-bold mr-lg whitespace-no-wrap" slot="behind">{{
            $i18n.locale === 'cn' ? '中文' : 'English'
          }}</span>
        </Language>
      </div>
    </div>
  </el-header>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style lang="scss">
.login-lang-box {
  padding-left: 5px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  height: 36px;
  border-radius: 20px;
  .language-icon {
    height: 36px;
  }
}
</style>
