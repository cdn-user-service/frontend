<template>
  <div>
    <ants-dialog
      title="绑定账号邮箱"
      v-model="dialogVisible"
      width="550px"
      ref="dialogRef"
      @close="resetForm"
      @submit="submitForm"
    >
      <div class="font-bold text-center mb-xl">
        {{ antsT('绑定账号邮箱，作为辅助验证方式，可使用邮箱登录。') }}
      </div>
      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-position="top"
      >
        <ants-form-item prop="mail">
          <ants-input
            is-bgc
            v-model="form.mail"
            prefix-icon="aicon icon-youxiang1"
            placeholder="请输入邮箱"
          />
        </ants-form-item>
        <ants-form-item prop="code" class="code_box">
          <ants-input
            is-bgc
            v-model="form.code"
            prefix-icon="aicon icon-yanzhengma2"
            placeholder="验证码"
          />
          <el-button
            type="info"
            :disabled="captchaData.btnIsDisabled || isRegistedLoading"
            @click="showCaptchaDialog"
            >{{ antsT(captchaData.btnText) }}</el-button
          >
        </ants-form-item>
      </ants-form>
    </ants-dialog>

    <!-- 获取手机短信验证数字验证码对话框 -->
    <CaptchaDialog
      ref="CaptchaDialogRef"
      :btn-text.sync="captchaData.btnText"
      :btn-is-disabled.sync="captchaData.btnIsDisabled"
    />
  </div>
</template>

<script>
import { bindMailMobile } from '@/v2/cdn_users/api/cdn/account'

import { checkRegister } from '@/v2/cdn_users/api/login'

import CaptchaDialog from '@/v2/cdn_users/components/CaptchaDialog'

export default {
  components: {
    CaptchaDialog
  },
  data() {
    const { isEmail } = this.$validator

    // 验证邮箱是否已存在
    const checkIsRegisted = (rule, value, callback) => {
      if (this.isRegisted) return callback(new Error('该邮箱已被绑定'))
      callback()
    }

    return {
      dialogVisible: false,
      form: {
        mail: '',
        code: ''
      },
      formRules: {
        mail: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: ['change', 'blur']
          },
          {
            validator: isEmail(),
            trigger: 'blur'
          },
          {
            validator: checkIsRegisted,
            trigger: 'blur'
          }
        ],
        code: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur']
          }
        ]
      },
      captchaData: {
        btnText: '获取验证码',
        btnIsDisabled: false
      },

      // 账号是否已存在
      isRegisted: false,
      isRegistedLoading: false
    }
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
    },
    
    /**
     * @description: 点击获取验证码，显示数字验证码对话框
     */
    async showCaptchaDialog() {
      // 验证邮箱是否已存在
      this.isRegistedLoading = true
      const { data: res } = await checkRegister({
        user: this.form.mail.trim()
      })
      this.isRegistedLoading = false
      if (res.code !== 1) return
      // 如果已注册
      if (res.data == 1) {
        this.$msg.error(this.antsT('该邮箱已被绑定'))
        this.isRegisted = true
      }

      // 单独验证是否输入了手机号或者邮箱
      this.$refs.formRef.validateField('mail', async valid => {
        // 恢复
        this.isRegisted = false

        // 如果没有输入邮箱则返回
        if (valid) return
        // 显示验证数字验证码对话框
        this.$refs.CaptchaDialogRef.showDialog('mail', this.form.mail)
      })
    },

    /**
     * @description: 绑定邮箱提交
     */
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        // 发起请求
        const { data: res } = await bindMailMobile({
          ...this.form
        })
        this.$refs.dialogRef.btnLoading = false
        if (res.code !== 1) return
        this.$msg.success(this.antsT('绑定邮箱成功'))
        // 重新获取用户信息
        this.$listeners.getUserData()
        this.dialogVisible = false
      })
    },

    // 表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
