<template>
  <el-main class="bg-ants-bg-2">
    <div class="ants-main-box">
      <Breadcrumb v-if="!$route.meta.hiddenBreadcrumb" />
      <ActiveMain />
    </div>
    <AntsFooter />
  </el-main>
</template>

<script>
// 不同项目导入不同的 main.vue 组件，定义不同的内容
const ActiveMain =
  require(`@/v2/${process.env.VUE_APP_NAME}/views/main.vue`).default

export default {
  name: 'AntsMain',
  components: {
    ActiveMain
  }
}
</script>

<style lang="scss" scoped>
.el-main {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.06);

  @media screen and (max-width: 991px) {
    padding-bottom: 70px;
  }
  @media screen and (max-width: 768px) {
    padding: 10px 10px 70px;
  }
}

@media screen and (min-width: 768px) {
  .ants-main-box {
    min-height: calc(100% - 71px);
  }
}
</style>
