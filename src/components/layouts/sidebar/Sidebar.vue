<template>
  <el-aside
    :width="iscollapse ? '70px' : '220px'"
    :class="[
      { 'layout-ltr': showLogo },
      { 'fixed-aisde': device != 'pc' },
      'ants-aside-' + layoutTheme.asideTheme
    ]"
  >
    <!-- enter-active-class="animated lightSpeedIn"
      leave-active-class="animated lightSpeedOut" -->

    <transition name="logo">
      <Logo
        v-if="showLogo || device != 'pc'"
        :theme-mode="layoutTheme.asideTheme"
        :style="[
          { 'padding-left': iscollapse ? '15px' : '0' },
          { 'justify-content': iscollapse ? 'flex-start' : 'center' }
        ]"
      />
    </transition>

    <ScrollerMenu :iscollapse="iscollapse">
      <template v-for="item of routes">
        <component
          :is="!item.meta.levelHidden ? 'SubMenuItem' : 'MenuItem'"
          :key="item.path"
          :item="!item.meta.levelHidden ? item : item.children"
          :iscollapse="iscollapse"
          :parentPath="item.path"
        ></component>
      </template>
    </ScrollerMenu>

    <div v-if="device === 'pc'" class="toggle_button" @click="toogleEmnu">
      <span :class="iscollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></span>
    </div>
  </el-aside>
</template>

<script>
import { mapState } from 'vuex'
const appName = process.env.VUE_APP_NAME

export default {
  name: 'AntsSideBar',
  props: {
    showLogo: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      iscollapse: false
    }
  },
  computed: {
    ...mapState(['layoutTheme', 'device']),
    routesObj() {
      if (appName.indexOf('dns') === -1) {
        return {}
      }
      const routesFile = require.context(
        `@/v2/${process.env.VUE_APP_NAME}/router/routes`,
        false,
        /\.js$/
      )
      const obj = {}
      routesFile.keys().forEach((key) => {
        obj[key.replace(/(modules|\/|\.|js)/g, '')] = routesFile(key).default
      })
      return obj
    },

    routes({ $route }) {
      const ROUTER_NAME = $route.path.split('/')[1]
      if (ROUTER_NAME === 'redirect') return []
      if (!this.routesObj[ROUTER_NAME]) return []
      return this.routesObj[ROUTER_NAME].filter(
        (item) => !item.meta.hidden && item.children
      )
    }
  },
  created() {},
  methods: {
    toogleEmnu() {
      this.iscollapse = !this.iscollapse
    }
  }
}
</script>

<style lang="scss" scoped>
@use '../../../assets/css/variables.scss' as *;

.el-aside {
  position: relative;
  padding-bottom: 56px;
  // box-shadow: 18px 0 15px rgba(0, 0, 0, 0.02);
  overflow-x: hidden;

  .toggle_button {
    line-height: 50px;
    width: 100%;
    text-align: center;
    font-size: 20px;
    cursor: pointer;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    &:hover {
      color: theme('colors.primary');
    }
  }
}

.el-aside.layout-ltr {
  padding-top: $headerHeight;
  .ants-logo-box {
    margin: 0;
    margin-top: -$headerHeight;
  }
}

.el-aside.fixed-aisde {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999;
  height: 100%;
}
</style>

<style lang="scss">
@use '../../../assets/css/layout.scss' as *;
// 浅色主题色
.ants-aside-light {
  background-color: $light-bgc-1;
  .toggle_button {
    color: $light-font-1;
    background-color: $light-bgc-1;
    box-shadow: 0px -1px 15px 1px rgba(69, 65, 78, 0.05);
  }

  .el-menu-item,
  .el-submenu__title {
    color: $light-font-2;
    i {
      color: $light-font-2;
    }
  }

  .ants-logo-box {
    border-bottom: 1px solid $light-border-1;
  }
}

// 深色主题颜色
.ants-aside-dark {
  background-color: $dark-bgc-1;
  .toggle_button {
    color: $dark-font-1;
    background-color: $dark-bgc-1;
    box-shadow: 0px -1px 15px 1px rgba(255, 255, 254, 0.05);
  }

  .el-menu-item,
  .el-submenu__title {
    color: $dark-font-2;
    i {
      color: $dark-font-2;
    }
  }

  .ants-logo-box {
    border-bottom: 1px solid $dark-border-1;
  }
}
</style>
