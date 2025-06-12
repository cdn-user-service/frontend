<template>
  <ants-dialog
    :title="`${antsT('设置客户端菜单')}【${form.username}】`"
    v-model="dialogVisible"
    width="750px"
    top="5vh"
    ref="dialogRef"
    @close="resetForm"
    @submit="submitForm"
  >
    <!-- 树形结构 -->
    <el-tree
      :data="menuList"
      :props="elTreeProps"
      show-checkbox
      node-key="path"
      default-expand-all
      check-on-click-node
      check-strictly
      :indent="20"
      :default-checked-keys="defKeys"
      ref="treeRef"
    >
    </el-tree>
  </ants-dialog>
</template>

<script>
// api
import { doUpdateUser } from '@/v2/cdn_admin/api/account/users'

// 客户端菜单数组
import clientRoutes from '@/v2/cdn_users/router/routes'

const menuList = []
const allCheckArr = []
// clientRoutes.forEach(item => {
//   if (item.meta.isMenu) {
//     // 如果为独立的 el-menu-item
//     const path1 = item.meta.levelHidden ? item.redirect : item.path
//     const obj = {
//       title: item.meta.title,
//       path: path1,
//       children: []
//     }
//     allCheckArr.push(path1)

//     item.children.forEach(item2 => {
//       if (item2.meta.isMenu) {
//         const path = item.path + '/' + item2.path
//         obj.children.push({
//           title: item2.meta.title,
//           path
//         })
//         allCheckArr.push(path)
//       }
//     })
//     menuList.push(obj)
//   }
// })

export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        username: '',
        userId: null
      },
      menuList,

      elTreeProps: {
        // 树形结构属性绑定对象
        children: 'children',
        label: 'title'
      },
      defKeys: [] // 默认选中的子节点ID数值
    }
  },
  methods: {
    // 分配权限对话框显示
    async showDialog(row) {
      this.dialogVisible = true
      const { unvalidModel, username, userId } = row
      this.form.username = username
      this.form.userId = userId

      // 如果没有值，则设为全部选中
      if (!unvalidModel) {
        this.defKeys = allCheckArr
        return
      }

      // 如果有值，则解析 unvalidModel 菜单
      if (unvalidModel && typeof unvalidModel === 'string') {
        const arr = unvalidModel.split(',')
        this.defKeys = allCheckArr.filter((item) => arr.indexOf(item) === -1)
      }
    },

    /**
     * @description: 更新提交要分配权限
     */

    async submitForm() {
      // 选中的数组
      const checkArr = this.$refs.treeRef.getCheckedKeys()
      // 过滤出为选中的数据
      const arr = allCheckArr.filter((item) => checkArr.indexOf(item) === -1)
      this.$refs.dialogRef.btnLoading = true

      const { data: res } = await doUpdateUser({
        userId: this.form.userId,
        unvalidModel: arr.length ? arr + '' : 0
      })
      this.$refs.dialogRef.btnLoading = false
      if (res.code !== 1) return
      this.dialogVisible = false
      this.$parent.getTableData()
      this.$msg.success(this.antsT('操作成功'))
    },

    // 对话框
    resetForm() {
      this.defKeys = []
      this.$refs.treeRef.setCheckedKeys([])
    }
  }
}
</script>
