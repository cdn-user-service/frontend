<template>
  <div>
    <el-card class="horizontal-menu-box">
      <el-button
        icon="el-icon-back"
        circle
        size="mini"
        v-if="backPath"
        @click="$router.push(backPath)"
      ></el-button>

      <span class="animated fadeInRight inline-block">
        <ants-copy :text="antsT(title)" inline />

        <slot name="title-right"></slot>
      </span>

      <el-menu mode="horizontal" :router="router" :default-active="activePath">
        <el-menu-item
          v-for="item in menuList"
          :key="item.path"
          :index="parentPath + item.path"
          >{{ antsT(item.title) }}</el-menu-item
        >
      </el-menu>
    </el-card>

    <slot name="header"></slot>

    <div class="content-box">
      <router-view :key="key" v-bind="$attrs" v-on="$listeners"></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HorizontalMenu',
  props: {
    menuList: {
      type: Array,
      default: () => []
    },
    parentPath: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    backPath: {
      type: String,
      default: ''
    },
    router: {
      type: Boolean,
      default: true
    },
    isFullPath: Boolean
  },
  computed: {
    activePath({ $route }) {
      return $route[this.isFullPath ? 'fullPath' : 'path'].replace(
        $route.meta.childPath,
        ''
      )
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss">
.horizontal-menu-box {
  font-size: 15px;
  margin: 0;
  font-weight: 600;
  .el-card__body {
    padding: 15px 20px 0;
  }
  .el-breadcrumb {
    margin: 0;
  }
  .el-button.is-circle {
    vertical-align: middle;
    margin-top: -2px;
    margin-right: 10px;
  }

  .el-menu.el-menu--horizontal {
    border: none;
    margin-top: 8px;
    > .el-menu-item {
      padding: 0 6px;
      margin-right: 20px;
      line-height: 40px;
      height: 40px;
      color: theme('colors.ants-text-3');

      @media screen and (max-width: 767px) {
        margin-right: 10px;
        font-size: 13px;
      }
    }

    > .el-menu-item:hover {
      color: theme('colors.primary');
    }

    > .el-menu-item.is-active {
      color: theme('colors.primary');
      border-bottom-color: theme('colors.primary');
    }

    > li:last-child {
      margin: 0;
    }
  }
}

.lang-en {
  .horizontal-menu-box {
    .el-menu {
      .el-menu-item {
        font-weight: 400;
        font-size: 13px;
      }
    }
  }
}
</style>
