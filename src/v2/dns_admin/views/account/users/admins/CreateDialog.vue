<template>
  <ants-dialog
    title="添加管理"
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
          v-model="form.username"
          placeholder="请输入管理账号"
          maxlength="30"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label=" 手 机 号" prop="mobile">
        <ants-input
          v-model="form.mobile"
          placeholder="请输入手机号"
          maxlength="50"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label=" 邮 箱 号" prop="email">
        <ants-input
          v-model="form.email"
          placeholder="请输入邮箱号"
          maxlength="50"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="管理密码" prop="password1">
        <ants-input
          v-model="form.password1"
          type="password"
          placeholder="请输入管理密码"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="确认密码" prop="password">
        <ants-input
          v-model="form.password"
          type="password"
          placeholder="请输入确认密码"
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
import { doCreateManager } from '@/v2/dns_admin/api/account/user'
const defaultForm = {
  // 添加对话框的表单数据
  userId: 0,
  mobile: '',
  email: '',
  username: '',
  password1: '',
  password: '',
  status: 1,
  roleIdList: [],
  info: ''
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
      dialogVisible: false, // 添加管理对话框弹窗显示
      form: {
        ...defaultForm
      }
    }
  },
  methods: {
    /**
     * @description: 添加管理提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doCreateManager(this.form)
        this.$refs.dialogRef.btnLoading = false
        if (res.code !== 1) return

        this.$parent.getGoodsList()
        this.dialogVisible = false
        this.$msg.success('添加管理成功')
      })
    },

    // 添加分组表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
