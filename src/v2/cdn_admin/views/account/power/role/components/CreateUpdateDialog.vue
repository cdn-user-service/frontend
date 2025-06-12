<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '角色'"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
    >
      <ants-form-item label="角色名称" prop="roleName">
        <ants-input
          v-model="form.roleName"
          maxlength="17"
          show-word-limit
          placeholder="请输入角色名称"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="角色描述" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入角色描述"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 4 }"
          maxlength="50"
          show-word-limit
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateRole, doUpdateRole } from '@/v2/cdn_admin/api/account/role'

const defaultForm = {
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
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: ['change', 'blur']
          }
          // {
          //   validator: checkroleName,
          //   trigger: 'blur'
          // }
        ],
        remark: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: ['change', 'blur']
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

    showDialog(row) {
      this.dialogVisible = true
      if (!row.roleId) {
        this.title = '添加'
        this.form = {
          ...defaultForm
        }
      } else {
        this.title = '修改'
        this.form = {
          ...row,
          menuIdList: row.menuIdList || [0]
        }
      }
    },

    /**
     * @description: 添加-修改角色提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        try {
          const { data: res } = await (!this.form.roleId
            ? doCreateRole(this.form)
            : doUpdateRole(this.form))

          if (res.code !== 1) return

          this.$parent.getTableData()
          this.dialogVisible = false
          this.$msg.success(this.title + '角色成功')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
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
