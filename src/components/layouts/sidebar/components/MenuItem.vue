<template>
  <li>
    <el-menu-item
      :index="parentPath + '/' + item.path"
      v-for="(item, idx) in menuItem"
      :key="item.path + idx"
    >
      <i :class="item.meta.icon || 'el-icon-menu'"></i>
      <span class="one_show_h" style="width:90%;">{{
        antsT(item.meta.title)
      }}</span>

      <el-badge
        :value="$root.menuBadge[item.meta.badge]"
        type="danger"
        class="menu-item-badge"
        v-show="!iscollapse"
        v-if="item.meta.badge"
      >
      </el-badge>
    </el-menu-item>
  </li>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    item: {
      type: Array,
      default: () => []
    },
    parentPath: {
      type: String,
      default: ''
    },
    iscollapse: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    menuItem({ $root }) {
      return this.item.filter(item => {
        // 是否显示定制版模块
        if (item.meta.custom && !this.debug) {
          return ($root.custom || {})[item.meta.custom] > 0
        }

        // 是否后台设置了显示权限
        if (
          !item.meta.hidden &&
          $root.userinfo &&
          $root.userinfo.unvalidModel
        ) {
          const fullPath = this.parentPath + '/' + item.path
          // 隐藏菜单
          return $root.userinfo.unvalidModel.indexOf(fullPath) === -1
        }

        return !item.meta.hidden
      })
    }
  },
  data() {
    return {}
  },
  created() {},
  methods: {}
}
</script>

<style lang="scss">
.el-badge.menu-item-badge {
  position: absolute;
  right: 10px;
  .el-badge__content {
    padding: 4px;
    min-width: 20px;
    height: auto;
    line-height: 1;
    color: #fefefe;
    border-radius: 4px;
    vertical-align: middle;
    margin-top: 9px;
    border: none;
  }
}
</style>
