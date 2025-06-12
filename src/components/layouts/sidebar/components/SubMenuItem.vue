<template>
  <div class="ants-submenu" v-if="isShow">
    <el-submenu :key="item.path" :index="item.path">
      <template slot="title">
        <i :class="item.meta.icon"></i>
        <span>{{ antsT(item.meta.title) }}</span>
        <span
          v-if="item.meta.badge && $root.menuBadge[item.meta.badge]"
          class="inline-block rounded-xl bg-error"
          style="padding: 3px; margin-left: 6px"
        >
        </span>
      </template>

      <MenuItem
        :item="item.children"
        :parentPath="item.path"
        :iscollapse="iscollapse"
      />
    </el-submenu>
  </div>
</template>

<script>
export default {
  name: 'SubMenuItem',
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    iscollapse: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isShow({ $root }) {
      // 客户端才有
      const { userinfo } = $root
      if (this.item.meta.isMenu && userinfo && userinfo.unvalidModel) {
        // 隐藏菜单
        return userinfo.unvalidModel.indexOf(this.item.path) === -1
      }

      // 是否显示定制版模块
      if (this.item.meta.custom && !this.debug) {
        return ($root.custom || {})[this.item.meta.custom] > 0
      }

      return true
    }
  }
}
</script>

<style lang="scss">
// 重置折叠样式
.el-menu--collapse {
  .ants-submenu {
    .el-submenu__title {
      span {
        height: 0;
        width: 0;
        overflow: hidden;
        visibility: hidden;
        display: inline-block;
      }

      .el-submenu__icon-arrow {
        display: none;
      }
    }
  }
}
</style>
