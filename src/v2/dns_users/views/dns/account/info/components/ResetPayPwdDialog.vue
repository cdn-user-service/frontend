<template>
  <ants-dialog
    title="重置支付密码"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="font-bold text-center mb-xl">
      {{ antsT('重置支付密码，需要验证绑定手机号或邮箱') }}
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
    >
      <ants-form-item prop="username">
        <ants-input
          is-bgc
          v-model="form.username"
          prefix-icon="aicon icon-yonghu-"
          placeholder="请输入手机号或邮箱地址"
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
          :disabled="captchaData.btnIsDisabled"
          @click="showCaptchaDialog"
          >{{ antsT(captchaData.btnText) }}</el-button
        >
      </ants-form-item>

      <ants-form-item prop="paypwd1">
        <ants-input
          is-bgc
          v-model="form.paypwd1"
          type="password"
          prefix-icon="aicon icon-mima1"
          placeholder="请输入新的支付密码"
        />
      </ants-form-item>
      <ants-form-item prop="paypwd2">
        <ants-input
          is-bgc
          v-model="form.paypwd2"
          type="password"
          prefix-icon="aicon icon-mima1"
          placeholder="请输入确认密码"
          @keyup.enter.native="submitForm()"
        />
      </ants-form-item>
    </ants-form>

    <!-- 获取手机短信验证数字验证码对话框 -->
    <CaptchaDialog
      ref="CaptchaDialogRef"
      :btn-text.sync="captchaData.btnText"
      :btn-is-disabled.sync="captchaData.btnIsDisabled"
    />
  </ants-dialog>
</template>

<script>
// API
import { payPasswordReset } from '@/v2/dns_users/api/dns/account'

import CaptchaDialog from '@/v2/dns_users/components/CaptchaDialog'

// 验证规则
import { isTel, isEmail } from '@/utils/validate'

export default {
  components: {
    CaptchaDialog
  },
  data() {
    // 密码验证规则
    const { isPassword } = this.$validator

    // 验证重置支付密码是否一致
    const checkResetPaypwd = (rule, value, callback) => {
      if (value === this.form.paypwd1) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    // 验证邮箱和手机号的验证规则
    const checkResetPaypwdName = (rule, value, callback) => {
      const regValue = value.trim()
      // 如果为手机号注册
      if (isTel(regValue)) {
        this.regType = 'mobile'
        return callback()
      }
      // 如果为邮箱注册
      if (isEmail(regValue)) {
        this.regType = 'mail'
        return callback()
      }
      callback(new Error('请输入合法的邮箱或手机号'))
    }

    return {
      // 重置支付密码
      dialogVisible: false,
      // 重置方式
      regType: 'mail', 
      captchaData: {
        // 获取短信验证码按钮文字
        btnText: '获取验证码',
        // 获取短信验证码按钮是否禁用
        btnIsDisabled: false
      },

      form: {
        username: '',
        code: '',
        paypwd2: '',
        paypwd1: ''
      },
      formRules: {
        code: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur']
          }
        ],
        paypwd1: [
          {
            required: true,
            message: '请输入新的支付密码',
            trigger: ['change', 'blur']
          },
          {
            validator: isPassword(),
            trigger: 'blur'
          }
        ],

        paypwd2: [
          {
            required: true,
            message: '请输入确认密码',
            trigger: ['change', 'blur']
          },
          {
            validator: checkResetPaypwd,
            trigger: 'blur'
          }
        ],
        username: [
          {
            required: true,
            message: '请输入手机号或邮箱地址',
            trigger: ['change', 'blur']
          },
          {
            validator: checkResetPaypwdName,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 点击获取验证码，显示数字验证码对话框
     */

    showCaptchaDialog() {
      // 单独验证是否输入了手机号或者邮箱
      this.$refs.formRef.validateField('username', async valid => {
        // 如果没有输入邮箱则返回
        if (valid) return
        // 显示验证数字验证码对话框
        this.$refs.CaptchaDialogRef.showDialog(this.regType, this.form.username)
      })
    },

    /**
     * @description: 重置支付密码提交
     */
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await payPasswordReset({
          code: this.form.code,
          [this.regType]: this.form.username,
          paypwd: this.form.paypwd2
        })
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$alert(
          this.antsT('重置支付密码成功，请牢记您的支付密码'),
          this.antsT('友情提示'),
          {
            type: 'success',
            center: true,
            callback: action => {
              this.dialogVisible = false
            }
          }
        )
      })
    },

    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
