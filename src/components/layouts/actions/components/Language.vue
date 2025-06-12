<template>
  <el-dropdown
    placement="bottom"
    trigger="hover"
    :show-timeout="100"
    @command="handleCommand"
  >
    <slot>
      <span class="flex items-center">
        <slot name="front"></slot>
        <span
          class="aicon icon-globe language-icon flex justify-center items-center"
          style="font-size:18px;"
        ></span>
        <slot name="behind"></slot>
      </span>
    </slot>

    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        icon="aicon icon-icon-zhongwenx"
        command="cn"
      >简体中文</el-dropdown-item>
      <el-dropdown-item
        icon="el-icon-s-promotion"
        command="en"
      >English</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { setup } from '@/i18n'
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Language',
  data() {
    return {}
  },

  methods: {
    ...mapMutations(['toggleLang']),
    handleCommand(command) {
      if (this.$i18n.locale === command) return
      // 更新本地 lang
      this.toggleLang(command)
      // 切换语言
      setup(command)
      this.$msg.success(command === 'en' ? 'Switch to English' : '切换为中文')
      // document.title = getPageTitle(this.$route.meta.title)
    }
  }
}
</script>

<style lang="scss" scoped>
.language-icon {
  height: 40px;
  width: 40px;
}
</style>
