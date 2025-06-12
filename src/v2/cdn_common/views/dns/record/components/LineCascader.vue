<template>
  <el-cascader
    :props="props"
    @change="lineHandleChange"
    :placeholder="placeholder"
    size="small"
    filterable
    ref="cascaderRef"
    :show-all-levels="false"
    :popper-class="`line-cascader${index} line-cascader`"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #default="{ node, data }">
      <span class="cascader-span" @click="mouseenterSubcat(node)">{{
        data.label
      }}</span>
      <!-- @mouseenter="mouseenterSubcat(node)" -->
    </template>
  </el-cascader>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getlineListV2 } = require(`@/v2/${PROCESS_NAME}/api/cdn/dns`)

export default {
  props: {
    placeholder: [String, Number],
    index: Number
  },
  data() {
    return {
      props: {
        // 触发方式
        expandTrigger: 'click',
        // 是否严格的遵守父子节点不互相关联
        checkStrictly: true,
        // 只返回该节点的值
        emitPath: false,
        // 多选
        multiple: false,
        // 开启懒加载
        lazy: true,
        lazyLoad: this.getLineListData
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 线路懒加载数据
     */

    async getLineListData(node, resolve) {
      // 如果没有子项关闭加载样式
      if (!node.root && node.data.child == 0) {
        node.loading = false
        return
      }
      const { data: res } = await getlineListV2({
        parentId: (node.data || {}).id || 0,
        id: this.$route.query.id || 0
      })

      if (!res.data.length) return

      const nodes = res.data.map((e, i) => ({
        value: e.name,
        id: e.id,
        label: e.name,
        child: e.child,
        leaf: e.child == 0,
        disabled: e.id === 9999999999
      }))

      resolve(nodes)
    },

    // 选择线路类型
    lineHandleChange(val) {
      // 选择后立即隐藏下拉框
      this.$refs.cascaderRef.dropDownVisible = false
    },

    /**
     * @description: 给cascader绑定鼠标 移入移除事件  实现hover无二级菜单时隐藏二级菜单
     * @param {*} node
     */
    mouseenterSubcat(node) {
      const index = this.index
      // 获取当前所有打开菜单集合
      const menus = document.querySelectorAll(
        `.line-cascader${index} .el-cascader-menu`
      )
      const inActivePath =
        menus[node.level - 1].querySelector('.in-active-path')
      if (menus.length > node.level && menus.length !== 1) {
        if (node.isLeaf) {
          // 如果无二级菜单，隐藏下级所有打开菜单
          for (let i = node.level; i < menus.length; i++) {
            menus[i].style.display = 'none'
          }
          if (inActivePath) {
            inActivePath.classList.remove('in-active-path')
          }
        } else {
          // 如果有二级菜单，则显示
          menus[node.level].style.display = 'block'
        }
      }
    }
  }
}
</script>

<style lang="scss">
.line-cascader {
  .el-cascader-panel {
    height: 352px;
  }
  .el-scrollbar__wrap {
    overflow-x: hidden;
    height: 100%;
    .el-cascader-node {
      position: relative;
    }
    .el-cascader-node > .el-radio {
      z-index: 1;
      .el-radio__input {
        height: 15px;
      }
    }
    .el-cascader-node__label {
      padding-right: 0;
      .cascader-span {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding-left: 45px;
      }
    }
  }
}
</style>
