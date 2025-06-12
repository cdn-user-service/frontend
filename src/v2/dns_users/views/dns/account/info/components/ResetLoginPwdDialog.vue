<template>
  <ants-dialog
    title="重置登录密码"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="font-bold text-center mb-xl">
      {{ antsT('当前账户：') }}{{ username }}
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
    >
      <ants-form-item prop="password0">
        <ants-input
          is-bgc
          v-model="form.password0"
          type="password"
          prefix-icon="aicon icon-mima1"
          placeholder="请输入原始密码"
        />
      </ants-form-item>
      <ants-form-item prop="password1">
        <ants-input
          is-bgc
          v-model="form.password1"
          type="password"
          prefix-icon="aicon icon-mima1"
          placeholder="请输入新的密码"
        />
      </ants-form-item>
      <ants-form-item prop="password2">
        <ants-input
          is-bgc
          v-model="form.password2"
          type="password"
          prefix-icon="aicon icon-mima1"
          placeholder="请输入确认密码"
        />
      </ants-form-item>
      <ants-form-item prop="code" class="ants-captcha_item">
        <ants-input
          is-bgc
          placeholder="验证码"
          prefix-icon="aicon icon-zhucedengluyanzhengma"
          v-model="form.code"
          maxlength="32"
          @keyup.enter.native="submitForm()"
        />
        <AntsCaptcha ref="AntsCaptchaRef" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { resetPassword } from '@/v2/dns_users/api/dns/account'

export default {
  props: {
    username: {
      type: String,
      default: ''
    }
  },
  data() {
    // 密码验证规则
    const { isPassword } = this.$validator

    const checkPassWord2 = (rule, value, callback) => {
      if (value === this.form.password1) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    return {
      dialogVisible: false,

      // 修改密码数据
      form: {
        // 修改对话框的表单数据
        users: '',
        password0: '',
        password1: '',
        password2: '',
        code: '' // 图形验证码
      },
      formRules: {
        code: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur']
          }
        ],
        password0: [
          {
            required: true,
            message: '请输入原始密码',
            trigger: ['change', 'blur']
          }
        ],
        password1: [
          {
            required: true,
            message: '请输入新的密码',
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
            validator: checkPassWord2,
            trigger: 'blur'
          }
        ]
      }
    }
  },

  methods: {
    /**
     * @description: 修改密码提交
     */
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await resetPassword({
          o_password: this.form.password0,
          n_password: this.form.password2, 
          uuid: this.$refs.AntsCaptchaRef.random,
          code: this.form.code // 图形验证码
        })

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) {
          this.$refs.AntsCaptchaRef.changeCaptcha()
          this.form.code = ''
          return
          // return this.$alert(
          //   this.antsT(res.msg) ||
          //     this.antsT('重置密码失败，请确认原始密码是否正确'),
          //   this.antsT('友情提示'),
          //   {
          //     type: 'error',
          //     center: true,
          //     callback: action => {
          //       //   this.$refs.formRef.resetFields()
          //     }
          //   }
          // )
        }

        window.sessionStorage.clear()
        this.$alert(
          this.antsT('重置密码成功，请重新登录'),
          this.antsT('友情提示'),
          {
            type: 'success',
            center: true,
            callback: action => {
              this.dialogVisible = false
              this.$router.push('/login')
            }
          }
        )
      })
    },

    // 重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
