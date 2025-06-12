<template>
  <div class="ants-setting-box shadow p-sm" @click="openDrawer">
    <span class="el-icon-setting"></span>
  </div>
</template>

<script>
export default {
  name: 'Setting',
  data() {
    return {}
  },
  created() {},
  methods: {
    openDrawer() {
      this.$emit('open-drawer')
    }
  }
}
</script>

<style lang="scss" scoped>
.ants-setting-box {
  position: fixed;
  z-index: 999;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  // width: 40px;
  // height: 40px;
  line-height: 1;
  background-color: theme('colors.primary');
  color: #fefefe;
  font-size: 18px;
  border-radius: 8px 0 0 8px;
  cursor: pointer;

  .el-icon-setting {
    animation: 10s settingRotate linear infinite;
  }
  @keyframes settingRotate {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
