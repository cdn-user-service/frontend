<template>
  <div>
    <div class="mb-xl pb-sm text-2xl font-semibold text-center text-black">
      {{ antsT('找回您的密码') }}
    </div>

    <el-form
      label-width="0px"
      :model="form"
      :rules="formRules"
      ref="formRef"
      method="post"
      class="space-y-12"
    >
      <ants-form-item prop="username">
        <ants-input
          is-bgc
          :placeholder="powerObj.text"
          prefix-icon="aicon icon-yonghu-"
          v-model.trim="form.username"
          maxlength="32"
        />
      </ants-form-item>

      <ants-form-item prop="code">
        <div class="flex items-center justify-between">
          <ants-input
            is-bgc
            placeholder="验证码"
            prefix-icon="aicon icon-yanzhengma2"
            v-model="form.code"
            maxlength="32"
          />

          <el-button
            @click="showCaptchaDialog"
            type="info"
            class="ml-lg"
            style="padding:18px 15px;font-size:13px;"
            :disabled="btnIsDisabled"
            >{{ antsT(btnText) }}</el-button
          >
        </div>
      </ants-form-item>

      <ants-form-item prop="passwd1">
        <ants-input
          is-bgc
          placeholder="请输入新的密码"
          prefix-icon="aicon icon-mima1"
          v-model.trim="form.passwd1"
          show-password
          maxlength="32"
        />
      </ants-form-item>
      <ants-form-item prop="passwd">
        <ants-input
          is-bgc
          placeholder="请输入确认密码"
          prefix-icon="aicon icon-mima1"
          v-model.trim="form.passwd"
          show-password
          maxlength="32"
        />
      </ants-form-item>
      <ants-form-item>
        <ants-button
          type="primary"
          @click="submitForm"
          class="text-2xl w-full"
          :loading="btnLoading"
          text="重置密码"
        />
      </ants-form-item>
    </el-form>

    <div class="flex justify-between items-center mt-xl">
      <router-link to="/login">{{ antsT('前往登录') }}</router-link>
      <router-link to="/register" v-if="!isForbidRegister">{{ antsT('立即注册') }}</router-link>
    </div>

    <CaptchaDialog
      ref="CaptchaDialogRef"
      :btn-text.sync="btnText"
      :btn-is-disabled.sync="btnIsDisabled"
    />
  </div>
</template>

<script>
import { resetPassword } from '@/v2/cdn_users/api/login'

import CaptchaDialog from '@/v2/cdn_users/components/CaptchaDialog'

// 验证规则
import { isTel, isEmail } from '@/utils/validate'

export default {
  components: {
    CaptchaDialog
  },
  data() {
    // 验证规则
    const { isPassword } = this.$validator

    // 二次验证密码
    const checkPassWord2 = (rule, value, callback) => {
      if (value === this.form.passwd1) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    // 验证邮箱和手机号的验证规则
    const checkRegMail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regValue = value.trim()

      const { mobile, mail } = this.powerObj

      // 如果为手机号注册
      if (isTel(regValue) && mobile) {
        this.regType = 'mobile'
        return callback()
      }

      // 如果为邮箱注册
      if (isEmail(regValue) && mail) {
        this.regType = 'mail'
        return callback()
      }

      if (mobile && mail) {
        return callback(new Error('请输入正确的邮箱或手机号'))
      }

      if (mobile) {
        return callback(new Error('请输入正确的手机号'))
      }

      if (mail) {
        return callback(new Error('请输入正确的邮箱'))
      }
    }

    return {
      btnLoading: false,
      regType: 'mail',
      // 获取短信验证码按钮是否禁用
      btnIsDisabled: false,
      // 获取短信验证码按钮文字
      btnText: '获取验证码',

      form: {
        username: '',
        passwd1: '',
        passwd: '',
        code: ''
      },
      formRules: {
        username: [
          {
            required: true,
            message: '请输入要找回的账号',
            trigger: ['change', 'blur']
          },
          {
            validator: checkRegMail,
            trigger: 'blur'
          }
        ],
        code: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur']
          }
        ],

        passwd1: [
          {
            required: true,
            message: '请输入密码',
            trigger: ['change', 'blur']
          },
          {
            validator: isPassword(),
            trigger: 'blur'
          }
        ],
        passwd: [
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
  computed: {
    // 后台开启了哪些登录方式
    powerObj({ $root }) {
      const {
        WXLOGIN_CONFIG_KEY: wechat,
        SMS_CONFIG_KEY: mobile,
        MAIL_CONFIG_KEY: mail
      } = $root.powerObj

      let text = '请输入邮箱'
      if (mail) {
        text = '请输入邮箱'
      }
      if (mobile) {
        text = '手机号'
      }
      if (mobile && mail) {
        text = '请输入邮箱/手机号'
      }
      return { wechat, mobile, mail, text }
    },
    // 后台是否禁用注册功能，true = 禁用
    isForbidRegister({ $root }) {
      const { register } = $root.webConfig.power

      return register === 1
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
     * @description: 重置登录密码提交
     */

    submitForm() {
      // 表单与验证
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        const { data } = await resetPassword({
          [this.regType]: this.form.username,
          code: this.form.code,
          password: this.form.passwd
        })

        this.btnLoading = false

        if (data.code !== 1) return

        this.$alert('重置登录密码成功，请牢记您的登录密码', '友情提示', {
          type: 'success',
          center: true,
          callback: action => {
            this.$router.replace('/login')
          }
        })
      })
    }
  }
}
</script>
