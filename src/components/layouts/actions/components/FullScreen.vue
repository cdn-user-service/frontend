<template>
  <span
    class="flex justify-center items-center"
    :class="
      isFullscreen ? 'aicon icon-quanping3' : 'aicon icon-quanping2'
    "
    @click="click"
  ></span>
</template>

<script>
// 全屏组件
import screenfull from 'screenfull'

export default {
  name: 'FullScreen',
  data() {
    return {
      isFullscreen: false
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.destroy()
  },
  methods: {
    click() {
      if (!screenfull.isEnabled) {
        this.$msg.info('当前浏览器不支持全屏！')
        return false
      }
      screenfull.toggle()
    },
    change() {
      this.isFullscreen = screenfull.isFullscreen
    },
    init() {
      if (screenfull.isEnabled) screenfull.on('change', this.change)
    },
    destroy() {
      if (screenfull.isEnabled) screenfull.off('change', this.change)
    }
  }
}
</script>

<style lang="scss" scoped>
span {
  height: 40px;
  width: 40px;
}
</style>
