<template>
  <ants-dialog
    title="修改管理信息"
    width="600px"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      status-icon
    >
      <ants-form-item label="管理账号" prop="username">
        <ants-input
          v-model.trim="form.username"
          placeholder="请输入管理账号"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="手 机 号" prop="mobile">
        <ants-input
          v-model.trim="form.mobile"
          placeholder="请输入手机号"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="邮 箱 号" prop="email">
        <ants-input
          v-model.trim="form.email"
          placeholder="请输入邮箱号"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="选择角色" prop="roleIdList">
        <el-select
          v-model="form.roleIdList"
          multiple
          placeholder="请选择角色"
          style="width:100%;"
        >
          <el-option
            v-for="item in roleList"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
          >
          </el-option>
        </el-select>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doUpdateManager } from '@/v2/dns_admin/api/account/user'
const defaultForm = {
  userId: '',
  mobile: '',
  email: '',
  username: '',
  status: 1,
  roleIdList: []
}
export default {
  props: {
    // 角色列表
    roleList: {
      type: Array,
      default: () => []
    },
    // 表单验证规则
    formRules: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      btnLoading: false,

      // 修改管理信息
      dialogVisible: false, // 修改分组对话框弹窗显示
      form: {
        ...defaultForm
      }
    }
  },
  methods: {
    /**
     * @description: 点击修改管理员信息
     * @param {*} row
     */

    async showDialog(row) {
      this.form.userId = row.userId
      this.form.username = row.username
      this.form.mobile = row.mobile
      this.form.email = row.email
      this.form.status = row.status
      this.form.roleIdList = row.roleIdList || []
      this.dialogVisible = true
    },

    /**
     * @description: 修改管理员信息提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doUpdateManager(this.form)
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$parent.getGoodsList()
        this.$msg.success('修改管理员信息成功')
        this.dialogVisible = false
      })
    },

    // 修改管理员信息重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
