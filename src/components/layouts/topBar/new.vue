<template>
  <div
    class="top-bar-box"
    :class="[
      'top-bar-' + layoutTheme.headerTheme,
      'top-bar-mobile-' + layoutTheme.mainTheme
    ]"
  >
    <el-menu
      background-color="rgba(0, 0, 0, 0)"
      text-color="#fefefe"
      mode="horizontal"
      router
      unique-opened
      :default-active="onRoutes"
    >
      <el-menu-item
        v-for="item in routes"
        :key="item.path"
        :index="item.path"
      >
        <i :class="item.meta.icon"></i>
        <span>{{ antsT(item.meta.title) }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { mapState } from 'vuex'

// import topRoutes from '../../../router/top-router'

// 管理端才有 topBar，文件名命名为 top-routes.js
// const topRoutesFile = require.context(
//   `@/v2/${process.env.VUE_APP_NAME}/router`,
//   false,
//   /top-routes\.js$/
// )
// const topRoutes = []

// topRoutesFile.keys().forEach(key => {
//   topRoutes.push(...topRoutesFile(key).default)
// })

// topRoutes = require(`@/v2/${process.env.VUE_APP_NAME}/router/top-routes`).default || []
export default {
  name: 'AntsTopBarNew',
  data() {
    return {
    //   topRoutes
    }
  },
  computed: {
    ...mapState(['layoutTheme']),

    routes({ $store }) {
      const { addRouters = [] } = $store.state.permission
      return addRouters
    },

    onRoutes({ $route }) {
      // 计算当前选中页面路由
      const routers = $route.path.split('/')
      return '/' + routers[1]
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
@use "../../../assets/css/layout.scss" as *;

.top-bar-box {
  @media screen and (max-width: 1199px) {
    margin-left: 20px;
  }

  .el-menu-item * {
    vertical-align: baseline;
  }

  .el-menu-item {
    font-size: 14px;
    position: relative;
    padding: 0 15px;
    line-height: 32px;
    height: 32px;
    border-radius: 6px;

    .line_span {
      position: absolute;
      height: 14px;
      width: 1px;
      z-index: 9;
      background-color: rgba(255, 255, 255, 0.5);
      right: -10px;
      top: 24px;
    }
  }

  // .el-menu-item:nth-child(odd) {
  //   margin-right: 20px;
  // }
  .el-menu-item {
    margin-right: 20px;
  }

  .el-menu-item:last-child {
    margin-right: 0;
  }

  .el-menu-item i {
    margin-right: 5px;
    display: inline-block;
    margin-left: -2px;
    vertical-align: middle;
    margin-top: -1px;
  }

  .el-menu-item.is-active {
    i {
      font-size: 16px;
    }
    i,
    span {
      color: theme('colors.primary');
    }
  }

  .el-menu-item:focus,
  .el-menu-item:hover {
    background-color: rgba(0, 0, 0, 0) !important;

    > i,
    span {
      color: theme('colors.primary');
    }
  }

  .el-menu-item.is-active {
    border: none !important;
  }

  .el-menu.el-menu--horizontal {
    border: none;
  }

  @media screen and (max-width: 991px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999;
    background-color: theme('colors.ants-bg-2');
    box-shadow: 0px 1px 15px 1px rgba(69, 65, 78, 0.08);
    border-top: 1px solid theme('colors.ants-border-3');
    color: theme('colors.ants-text-1');
    margin: 0;

    .el-menu {
      display: flex;
      align-items: center;
    }

    .el-menu-item {
      flex: 1;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      line-height: 1;
      height: 56px;

      i {
        margin: 0 0 5px;
        display: inline-block;
        font-size: 18px !important;
      }

      span {
        font-size: 12px;
      }

      span,
      i {
        color: theme('colors.ants-text-3');
      }

      .line_span {
        display: none;
      }
    }

    .el-menu-item.is-active {
      border: none !important;
      background-color: rgba(255, 255, 255, 0) !important;

      span,
      i {
        color: theme('colors.primary');
      }
    }
  }
}

.top-bar-light {
  .el-menu-item {
    i,
    span {
      color: $dark-bgc-1;
    }
  }
  .el-menu-item.is-active {
    background-color: theme('colors.primary-light') !important;
  }
}

.top-bar-dark {
  .el-menu-item {
    i,
    span {
      color: $light-bgc-1;
    }
  }
  .el-menu-item.is-active {
    background-color: theme('colors.primary-light') !important;
  }
}

@media screen and (max-width: 991px) {
  .top-bar-mobile-light.top-bar-box {
    .el-menu-item {
      i,
      span {
        color: $dark-bgc-1;
      }
    }
    .el-menu-item.is-active {
      background-color: theme('colors.primary-light') !important;
    }
  }

  .top-bar-mobile-dark.top-bar-box {
    .el-menu-item {
      i,
      span {
        color: $light-bgc-1;
      }
    }
    .el-menu-item.is-active {
      background-color: #252b3a !important;
    }
  }
}
</style>
