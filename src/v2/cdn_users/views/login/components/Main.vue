<template>
  <el-main class="flex justify-center items-center">
    <div
      class="ants-login-form px-lg py-xxl sm:p-xxxl bg-white rounded-2xl overflow-hidden animated fadeInUp"
    >
      <router-view></router-view>
    </div>
  </el-main>
</template> 

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style lang="scss">
.ants-login-form {
  width: 480px;
  .el-button {
    padding: 15px 20px;
  }
}
</style>
