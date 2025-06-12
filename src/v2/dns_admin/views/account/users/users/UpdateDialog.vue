<template>
  <ants-dialog
    title="修改用户"
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
      <ants-form-item label="用户账号" required>
        <ants-input v-model.trim="form.users" disabled />
      </ants-form-item>
      <ants-form-item label="用户类型" prop="userType">
        <ants-select v-model="form.userType">
          <ants-option :value="2" label="普通用户" />
          <ants-option
            v-for="(item, key) in userTypeName"
            :key="key"
            :value="+key"
            :label="item"
          />
        </ants-select>
      </ants-form-item>
      <ants-form-item label="新的密码" prop="password">
        <ants-input
          v-model.trim="form.password"
          type="password"
          show-password
          placeholder="请输入新密码（选填）"
        />
      </ants-form-item>
      <!-- <ants-form-item label="确认密码" prop="password2">
        <ants-input
          v-model.trim="form.password2"
          type="password"
          placeholder="请输入确认密码（选填）"
        />
      </ants-form-item> -->
      <ants-form-item label="备注信息">
        <ants-input
          v-model="form.info"
          placeholder="请输入备注信息（选填）"
          maxlength="30"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateUser, doUpdateUser } from '@/v2/dns_admin/api/account/user'
import { isPassword } from '@/utils/validate'
const defaultForm = {
  // 修改对话框的表单数据
  users: '',
  user_id: '',
  password2: '',
  password: '',
  info: '',
  // 用户类型： 2 = 普通用户，> 2 = 代理用户
  userType: 2
}
export default {
  props: {
    userTypeName: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    // 修改用户
    const checkPassWord2 = (rule, value, callback) => {
      if (value === this.form.password1) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    // 验证规则
    // const { isPassword } = this.$validator

    return {
      dialogVisible: false, // 修改用户对话框弹窗显示
      btnLoading: false,
      form: {
        ...defaultForm
      },
      formRules: {
        // 修改用户对话框的规则
        password: [
          // {
          //   required: false,
          //   message: '请输入新的密码',
          //   trigger: ['change', 'blur']
          // },
          {
            validator: (rule, value, callback) => {
              if (value === '') return callback()
              if (isPassword(value)) return callback()
              callback(new Error('密码格式错误，不能包含中文（4 ~ 32）'))
            },
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
            validator: checkPassWord2,
            trigger: 'blur'
          }
        ],
        userType: [
          {
            required: true,
            message: '请选择用户类型',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    // 修改用户对话框显示
    async showDialog(row) {
      this.form.user_id = row.userId
      this.form.mobile = row.mobile
      this.form.mail = row.mail
      this.form.info = row.note
      this.form.users = row.username || row.mail || row.mobile
      this.form.userType = row.userType

      this.dialogVisible = true
    },

    // 提交修改用户
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        try {
          const { data: res } = await doUpdateUser({
            user_id: this.form.user_id,
            // mobile: this.form.mobile,
            // mail: this.form.mail,
            password: this.form.password,
            note: this.form.info,
            userType: this.form.userType
          })

          if (res.code !== 1) return

          this.dialogVisible = false
          this.$emit('refresh')
          this.$msg.success('修改用户信息成功')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 修改用户表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
