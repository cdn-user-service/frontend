<template>
  <ants-dialog
    title="重置登录密码"
    v-model="dialogVisible"
    width="500px"
    ref="dialogRef"
    @closed="closed"
    :footer="false"
    :showFullscreen="false"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      space-class="space-y-6"
      label-position="top"
    >
      <ants-form-item prop="password" style="margin-bottom: 0">
        <ants-input
          is-bgc
          prefix-icon="aicon icon-mima1"
          v-model="form.password"
          type="password"
          placeholder="请输入原始密码"
        ></ants-input>
      </ants-form-item>
      <ants-form-item prop="newPassword1">
        <ants-input
          is-bgc
          prefix-icon="aicon icon-mima1"
          v-model="form.newPassword1"
          type="password"
          placeholder="请输入新的密码"
        ></ants-input>
      </ants-form-item>
      <ants-form-item prop="newPassword">
        <ants-input
          is-bgc
          prefix-icon="aicon icon-mima1"
          v-model="form.newPassword"
          type="password"
          placeholder="请输入确认密码"
        ></ants-input>
      </ants-form-item>
      <ants-form-item style="margin: 30px 0 0">
        <ants-button
          type="primary"
          class="w-full"
          :loading="btnLoading"
          @click="submitForm()"
          style="padding: 15px 15px"
          text="确认修改"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { removeToken } from '@/utils/auth'
// API
import { resetPassword } from '@/v2/cdn_admin/api/account/admins'

export default {
  data() {
    const checknewPassword = (rule, value, callback) => {
      if (value === this.form.newPassword1) return callback()
      callback(new Error('两次输入的密码不一致'))
    }

    // 验证规则
    const { isPassword } = this.$validator

    return {
      dialogVisible: false,
      btnLoading: false,
      form: {
        // 修改对话框的表单数据
        password: '',
        newPassword1: '',
        newPassword: ''
      },
      formRules: {
        password: [
          {
            required: true,
            message: '请输入原始密码',
            trigger: 'blur'
          }
        ],
        newPassword1: [
          {
            required: true,
            message: '请输入新的密码',
            trigger: 'blur'
          },
          {
            validator: isPassword(),
            trigger: 'blur'
          }
        ],
        newPassword: [
          {
            required: true,
            message: '请输入确认密码',
            trigger: 'blur'
          },
          {
            validator: checknewPassword,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
    },

    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true
        try {
          const { password, newPassword } = this.form
          const { data: res } = await resetPassword({
            password,
            newPassword
          })

          if (res.code !== 1) {
            return this.$alert(
              this.antsT('修改密码失败，请确认原始密码是否正确'),
              this.antsT('修改密码失败'),
              {
                type: 'error',
                center: true,
                callback: (action) => {
                  this.$refs.formRef.resetFields()
                }
              }
            )
          }

          window.sessionStorage.clear()
          this.$alert(
            this.antsT('修改密码成功，请重新登录'),
            this.antsT('友情提示'),
            {
              type: 'success',
              center: true,
              callback: (action) => {
                removeToken()
                this.dialogVisible = false
                this.$router.push('/login')
              }
            }
          )
        } finally {
          this.btnLoading = false
        }
      })
    },

    // 表单重置
    closed() {
      this.form.password = ''
      this.form.newPassword1 = ''
      this.form.newPassword = ''
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
