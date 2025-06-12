<template>
  <el-container
    :direction="layoutTheme.layoutMode === 'ttb' ? 'vertical' : 'horizontal'"
    class="ants-container"
  >
    <!-- 上下 -->
    <template v-if="layoutTheme.layoutMode === 'ttb'">
      <AntsHeader />
      <el-container class="ants-main" direction="horizontal">
        <transition name="aside">
          <AntsSider
            v-if="appName.indexOf('cdn') != -1"
            ref="AntsSiderRef"
            :show-logo="false"
            v-show="device == 'pc' || isMobileAsideShow"
          />

          <AntsSideBar
            v-else
            ref="AntsSiderRef"
            :show-logo="false"
            v-show="device == 'pc' || isMobileAsideShow"
          />
        </transition>

        <AntsMain />
      </el-container>
    </template>

    <!-- 左右 -->
    <template v-else>
      <transition name="aside">
        <AntsSider
          v-if="appName.indexOf('cdn') != -1"
          ref="AntsSiderRef"
          v-show="device == 'pc' || isMobileAsideShow"
        />
        <AntsSideBar
          v-else
          ref="AntsSiderRef"
          v-show="device == 'pc' || isMobileAsideShow"
        />
      </transition>
      <el-container class="ants-main layout-ltr" direction="vertical">
        <AntsHeader :show-logo="false" />
        <AntsMain />
      </el-container>
    </template>

    <!-- 主题设置 -->
    <SettingDrawer ref="settingDrawerRef" />
    <Setting @open-drawer="openSettingDrawer" />

    <!-- 小屏幕下侧边栏展开遮盖盒子 -->
    <div
      class="mobile-shadow"
      v-if="device != 'pc'"
      @click="toggleMobileAsideShow(false)"
      v-show="isMobileAsideShow"
    ></div>
  </el-container>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
// 导入监听盒子高宽改变插件
import elementResize from 'element-resize-detector'
// 导入防抖插件
import { debounce } from 'throttle-debounce'

const appName = process.env.VUE_APP_NAME

// throttle: 节流阀，保证多少ms内只执行一次。
// debounce: 去抖，保证多少ms内不再被触发时就会执行一次。

export default {
  name: 'Layout',
  data() {
    return {
      appName
    }
  },
  computed: {
    ...mapState(['layoutTheme', 'device', 'isMobileAsideShow'])
  },
  created() {
    this.listenElementResize()
  },
  methods: {
    ...mapMutations([
      'changeLayoutTheme',
      'changeDevice',
      'changeIsPhone',
      'toggleMobileAsideShow'
    ]),

    openSettingDrawer() {
      this.$refs.settingDrawerRef.show()
    },

    /**
     * @description: 监听容器宽度改变，判断设备
     */

    listenElementResize() {
      const elRe = elementResize()
      // 防抖
      const resizeHandle = debounce(100, (width) => {
        // 控制小屏幕 大屏幕 下 左侧菜单隐藏显示，小屏隐藏，大屏显示
        let isPhone = false
        let isCollapse = false
        let device = 'pc'

        if (width <= 768) {
          isPhone = true
          device = 'mobile'
        }

        if (width > 768 && width < 992) {
          device = 'pad'
        }

        if (width >= 992 && width <= 1366) {
          isCollapse = true
        }

        this.changeIsPhone(isPhone)
        this.toggleCollapse(isCollapse)
        this.changeDevice(device)
      })

      elRe.listenTo(document.getElementById('app'), (element) => {
        resizeHandle(element.offsetWidth)
      })
    },

    // 侧边栏收缩-展开
    toggleCollapse(val) {
      if (this.$refs.AntsSiderRef) {
        this.$refs.AntsSiderRef.iscollapse = val
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ants-container {
  height: 100%;
  .mobile-shadow {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999998;
    background-color: rgba(0, 0, 1, 0.5);
  }
}
.ants-main {
  height: calc(100% - 60px);
}
.ants-main.layout-ltr {
  height: 100%;
}
</style>
