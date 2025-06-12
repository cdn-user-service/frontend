<template>
  <ants-dialog
    :title="dialogText + '角色'"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
      status-icon
    >
      <ants-form-item label="角色名称" prop="roleName">
        <ants-input v-model="form.roleName" placeholder="请输入角色名称" />
      </ants-form-item>
      <ants-form-item label="角色描述" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入角色描述"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateRole, doUpdateRole } from '@/v2/dns_admin/api/account/power'
const defaultForm = {
  // 添加对话框的表单数据
  roleId: 0,
  roleName: '',
  remark: '',
  menuIdList: [0]
}
export default {
  name: 'UpdateDialog',
  data() {
    // 验证角色名
    const checkroleName = (rule, value, callback) => {
      // 验证角色名的正则表达式，（字母，数字，下划线，减号）
      const regPassWord = /^[a-zA-Z0-9_-]{3,30}$/
      if (regPassWord.test(value)) {
        // 合法角色名
        return callback()
      }
      callback(new Error('请输入3 - 30位合法的角色名称'))
    }

    return {
      btnLoading: false,
      dialogText: '添加',
      dialogVisible: false, // 添加角色对话框弹窗显示
      form: {
        ...defaultForm
      },

      formRules: {
        roleName: [
          {
            required: true,
            message: '角色名称不能为空',
            trigger: 'blur'
          }
          //   {
          //     validator: checkroleName,
          //     trigger: 'blur'
          //   }
        ],
        remark: [
          {
            required: true,
            message: '备注信息不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     * @param {*} row
     */

    showUpdateDialog(row = {}) {
      this.dialogText = !row.roleId ? '添加' : '修改'
      this.form.roleId = row.roleId
      this.form.roleName = row.roleName
      this.form.remark = row.remark
      this.form.menuIdList = row.menuIdList || [0]

      this.dialogVisible = true
    },

    /**
     * @description: 添加-修改角色提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const { data: res } = await (!this.form.roleId
          ? doCreateRole(this.form)
          : doUpdateRole(this.form))

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return

        this.$parent.getGoodsList()
        this.dialogVisible = false
        this.$msg.success(this.dialogText + '角色成功')
      })
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
