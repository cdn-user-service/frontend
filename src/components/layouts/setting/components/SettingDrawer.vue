<template>
  <el-drawer
    :title="antsT('主题配置')"
    :visible.sync="opened"
    direction="rtl"
    size="300px"
    custom-class="theme-drawer"
    append-to-body
  >
    <div class="px-lg pb-lg">
      <ModeExample ref="modeExampleRef" />

      <ThemeColor />

      <OtherSetting />
    </div>

    <div class="theme-reset-btn flex justify-center items-center">
      <ants-button
        type="primary"
        size="small"
        @click="resetTheme"
        icon="el-icon-refresh-right"
        text="重置"
        />
      <!-- <ants-button type="success" size="small" @click="randomTheme(0, 4)" text="随机"
        /> -->
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'SettingDrawer',
  data() {
    return {
      opened: false
    }
  },
  created() {},
  methods: {
    /**
     * @description: 重置主题
     */

    resetTheme() {
      localStorage.removeItem('vuex')
      localStorage.removeItem('theme_color')
      localStorage.removeItem('themeMode')
      location.reload()
    },

    /**
     * @description: 随机
     */

    randomTheme(min, max) {
      const idx = parseInt(Math.random() * (max - min + 1) + min, 10)
      const exampleList = this.$refs.modeExampleRef.exampleList
      if (exampleList[idx]) {
        const mode = exampleList[idx].split('-')[3]
        this.$refs.modeExampleRef.changeMainThemeMode(mode)
      }
    },

    // 抽屉显示隐藏
    show() {
      this.opened = true
    }
  }
}
</script>

<style lang="scss">
.theme-drawer {
  padding-bottom: 60px;
  .el-drawer__header {
    padding: 17px 20px;
    margin-bottom: 0;
    > span {
      color: theme('colors.ants-text-1');
      font-weight: 600;
    }
  }
  .el-dialog__close {
    font-size: 12px;
    padding: 5px;
    border-radius: 12px;
    color: theme('colors.ants-bg-1');
    background-color: theme('colors.ants-text-1');
  }

  .theme-reset-btn {
    position: absolute;
    z-index: 1;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60px;
    background-color: theme('colors.ants-bg-1');
    border-top: 1px solid theme('colors.ants-border-4');
  }
}
</style>
