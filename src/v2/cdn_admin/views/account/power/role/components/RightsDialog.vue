<template>
  <ants-dialog
    :title="`${antsT('分配权限')}（${form.roleName}）`"
    v-model="dialogVisible"
    width="750px"
    top="5vh"
    ref="dialogRef"
    @close="resetForm"
    @submit="submitForm"
  >
    <!-- 树形结构 -->
    <el-tree
      :data="rightsDialogList"
      :props="rightsProps"
      show-checkbox
      node-key="menuId"
      default-expand-all
      :indent="20"
      :default-checked-keys="defKeys"
      ref="treeRef"
    >
    </el-tree>
  </ants-dialog>
</template>

<script>
// api
import {
  doUpdateRole
} from '@/v2/cdn_admin/api/account/role'
import {
  getMenuList
} from '@/v2/cdn_admin/api/account/menu'

export default {
  data() {
    return {
      form: {
        roleId: 0,
        roleName: '',
        remark: ''
      },

      // 分配权限对话框数据
      dialogVisible: false,
      rightsDialogList: [],
      rightsProps: {
        // 树形结构属性绑定对象
        children: 'list',
        label: 'name'
      },
      defKeys: [] // 默认选中的子节点ID数值
    }
  },
  methods: {
    /**
     * @description: 分配权限对话框显示
     */

    async showDialog(row) {
      this.form = {
        ...row
      }
      this.defKeys = row.menuIdList

      this.dialogVisible = true

      this.$refs.dialogRef.bodyLoading = true
      const { data: res } = await getMenuList()
      this.$refs.dialogRef.bodyLoading = false

      if (res.code !== 1) return
      this.rightsDialogList = res.data || []
    },

    /**
     * @description: 更新提交要分配权限
     */

    async submitForm() {
      const newKeys = [
        ...this.$refs.treeRef.getCheckedKeys()
        // ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      this.$refs.dialogRef.btnLoading = true

      const { data: res } = await doUpdateRole({
        roleId: this.form.roleId,
        roleName: this.form.roleName,
        remark: this.form.remark,
        menuIdList: newKeys
      })
      this.$refs.dialogRef.btnLoading = false

      if (res.code !== 1) return
      
      this.$parent.getTableData()

      this.dialogVisible = false
      this.$msg.success(this.antsT('分配权限成功'))
    },

        // 通过递归的形式，获取角色下所有的三级权限ID，
    // 并保存到 defKeys 这个数组中
    // getDefKeys(node, arr) {
    //   // 如果当前的 node 节点不包含 children属性，则是三级节点
    //   if (!node.menuIdList || !node.menuIdList.length) {
    //     return arr.push(node.menuId)
    //   }

    //   node.menuIdList.forEach(item => this.getDefKeys(item, arr))
    // },
    
    // 关闭权限分配 对话框
    resetForm() {
      this.rightsDialogList = this.defKeys = []
    }
  }
}
</script>
