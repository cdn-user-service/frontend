<template>
  <ants-dialog
    title="添加用户"
    v-model="dialogVisible"
    width="600px"
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
      <ants-form-item label="用户邮箱" prop="users">
        <ants-input
          v-model.trim="form.users"
          placeholder="请输入电子邮箱"
          maxlength="32"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label=" 手 机 号" prop="mobile">
        <ants-input
          v-model.trim="form.mobile"
          maxlength="50"
          placeholder="请输入手机号"
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="用户密码" prop="password1">
        <ants-input
          v-model.trim="form.password1"
          type="password"
          placeholder="请输入用户密码"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="确认密码" prop="password2">
        <ants-input
          v-model.trim="form.password2"
          type="password"
          placeholder="请输入确认密码"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="备注信息">
        <ants-input
          v-model="form.info"
          placeholder="请输入备注信息"
          maxlength="30"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateUser } from '@/v2/dns_admin/api/account/user'

const defaultForm = {
  users: '',
  mobile: '',
  password1: '',
  password2: '',
  info: ''
}
export default {
  data() {
    // 添加用户
    const checkPassWord3 = (rule, value, callback) => {
      if (value === this.form.password1) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    // 验证规则
    const { isName, isEmail, isTel, isPassword } = this.$validator

    return {
      btnLoading: false,
      dialogVisible: false,
      form: {
        // 添加对话框的表单数据
        ...defaultForm
      },

      formRules: {
        // 添加用户对话框的规则
        users: [
          {
            required: true,
            message: '用户邮箱不能为空',
            trigger: ['change', 'blur']
          },
          {
            validator: isEmail(),
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '手机号不能为空',
            trigger: ['change', 'blur']
          },
          {
            validator: isTel(),
            trigger: 'blur'
          }
        ],
        password1: [
          {
            required: true,
            message: '密码不能为空',
            trigger: ['change', 'blur']
          },
          {
            validator: isPassword(),
            trigger: 'blur'
          }
        ],
        password2: [
          {
            required: true,
            message: '请输入确认密码',
            trigger: ['change', 'blur']
          },
          {
            validator: checkPassWord3,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 添加用户提交
    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data } = await doCreateUser({
            user_id: 0,
            mobile: this.form.mobile,
            mail: this.form.users,
            password: this.form.password2,
            note: this.form.info
          })

          if (data.code !== 1) return
          this.dialogVisible = false
          this.$emit('refresh')
          this.$msg.success('添加用户成功')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 添加用户表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
