<template>
  <ants-dialog
    title="设置支付密码"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="font-bold text-center mb-xl">
      {{ antsT('设置支付密码，作为支付凭证') }}
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
    >
      <ants-form-item prop="paypwd1">
        <ants-input
          is-bgc
          v-model="form.paypwd1"
          type="password"
          prefix-icon="aicon icon-mima1"
          placeholder="请输入支付密码"
        />
      </ants-form-item>
      <ants-form-item prop="paypwd">
        <ants-input
          is-bgc
          v-model="form.paypwd"
          type="password"
          prefix-icon="aicon icon-mima1"
          placeholder="请输入确认支付密码"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { payPassword } from '@/v2/cdn_users/api/cdn/account'

export default {
  data() {
    // 验证规则
    const { isPassword } = this.$validator

    // 判断支付确认密码是否一致
    const checkPayPwd = (rule, value, callback) => {
      if (value === this.form.paypwd1) {
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    return {
      dialogVisible: false,
      form: {
        paypwd: '',
        paypwd1: ''
      },
      formRules: {
        paypwd1: [
          {
            required: true,
            message: '请输入支付密码',
            trigger: ['change', 'blur']
          },
          {
            validator: isPassword(),
            trigger: 'blur'
          }
        ],
        paypwd: [
          {
            required: true,
            message: '请输入确认密码',
            trigger: ['change', 'blur']
          },
          {
            validator: checkPayPwd,
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
    
    /**
     * @description: 设置支付密码提交
     */
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await payPassword({
          pwd: this.form.paypwd
        })
        this.$refs.dialogRef.btnLoading = false
        if (res.code !== 1) return
        this.$alert(
          this.antsT('设置支付密码成功，请牢记您的支付密码'),
          this.antsT('友情提示'),
          {
            type: 'success',
            center: true,
            callback: action => {
              this.dialogVisible = false
              this.$listeners.getUserData()
            }
          }
        )
      })
    },

    // 表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
