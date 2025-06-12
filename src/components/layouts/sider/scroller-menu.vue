<template>
  <el-scrollbar
    class="scrollbar"
    wrap-class="scrollbar-wrap-class"
    style="height:100%;"
  >
    <el-menu
      background-color="rgba(0, 0, 0, 0)"
      active-text-color="#177DFF"
      unique-opened
      :collapse="iscollapse"
      :collapse-transition="false"
      router
      :default-active="activeRoutes"
      mode="vertical"
      @select="handleSelect"
    >
      <slot></slot>
    </el-menu>
  </el-scrollbar>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'AntsScrollerMenu',
  props: {
    iscollapse: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(['device']),

    activeRoutes({ $route }) {
      // 计算当前选中页面路由
      const routers = $route.path.split('/')
      const activeRoute =
        '/' +
        routers[1] +
        '/' +
        routers[2] +
        (routers[3] ? '/' + routers[3] : '')
      return $route.meta.selectMenu || activeRoute
    }
  },
  created() {},
  methods: {
    ...mapMutations(['toggleMobileAsideShow']),

    handleSelect() {
      if (this.device != 'pc') {
        this.toggleMobileAsideShow(false)
      }
    }
  }
}
</script>

<style lang="scss">
.scrollbar {
  .el-menu {
    border: none;
    padding: 20px 10px 10px;
    .el-menu--inline {
      padding: 0;
    }

    .el-menu-item,
    .el-submenu__title {
      height: 48px;
      line-height: 48px;
      padding-right: 10px;
      margin: 3px 0;
      border-radius: 10px;
      // color: @ants-font-3;
      i {
        // color: @ants-font-3;
        font-size: 16px;
        margin-right: 10px;
        width: auto !important;
      }
      span {
        font-weight: 600;
      }
      .el-submenu__icon-arrow {
        font-size: 12px;
        right: 0;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0) !important;
        color: theme('colors.primary') !important;
        i {
          color: theme('colors.primary');
        }
      }
    }

    .el-menu-item.is-active {
      background-color: theme('colors.primary') !important;
      i,
      span {
        color: #fefefe !important;
      }
    }
  }
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .el-menu--collapse {
    .one_show_h {
      width: 0;
      height: 0;
      display: none;
    }
  }
}
.lang-en {
  .scrollbar {
    .el-menu {
      .el-menu-item,
      .el-submenu__title {
        span {
          font-weight: 400;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
