<template>
  <div class="bg-white rounded-2xl py-xxl px-24">
    <div class="mb-xl text-4xl text-center">
      {{ antsT('找回您的密码') }}
    </div>

    <el-form
      label-width="0px"
      class="space-y-8"
      :model="form"
      :rules="rules"
      ref="formRef"
      method="post"
    >
      <ants-form-item prop="username">
        <ants-input
          placeholder="请输入邮箱/手机号"
          prefix-icon="aicon icon-yonghu-"
          v-model="form.username"
          maxlength="32"
        />
      </ants-form-item>
      <ants-form-item prop="code">
        <div class="flex items-center captcha-box border border-ants-border-1">
          <ants-input
            placeholder="验证码"
            prefix-icon="aicon icon-yanzhengma2"
            v-model="form.code"
            maxlength="32"
          />

          <el-link
            @click="showCaptchaDialog"
            type="primary"
            :underline="false"
            :disabled="btnIsDisabled"
            style="padding: 0 10px;font-size:12px;white-space: nowrap;"
          >{{ antsT(btnText)}}
          </el-link>
        </div>
      </ants-form-item>
      <ants-form-item prop="newpassword">
        <ants-input
          placeholder="请输入新的密码"
          prefix-icon="aicon icon-mima1"
          v-model.trim="form.newpassword"
          show-password
          maxlength="32"
        />
      </ants-form-item>
      <ants-form-item prop="password">
        <ants-input
          placeholder="请输入确认密码"
          prefix-icon="aicon icon-mima1"
          v-model="form.password"
          show-password
          maxlength="32"
        />
      </ants-form-item>

      <ants-form-item class="pb-df">
        <ants-button
          type="primary"
          @click="submitForm"
          @keydown.enter="submitForm"
          :loading="btnLoading"
          class="w-full"
          text="重置密码"
        />
      </ants-form-item>

      <div class="flex justify-between">
        <router-link
          class="text-primary"
          to="/login"
        >
          {{ antsT('前往登录')}}
        </router-link>

        <router-link
          class="text-primary"
          to="/register"
          v-if="!isForbidRegister"
        >
          {{ antsT('立即注册') }}
        </router-link>
      </div>
    </el-form>

    <CaptchaDialog
      ref="CaptchaDialogRef"
      :btn-text.sync="btnText"
      :btn-is-disabled.sync="btnIsDisabled"
    />
  </div>
</template>

<script>
// 组件
import CaptchaDialog from '@/v2/dns_users/components/CaptchaDialog'
// 验证规则
import { isTel, isEmail } from '@/utils/validate'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { resetPassword } = require(`@/v2/${PROCESS_NAME}/api/login`)

export default {
  components: {
    CaptchaDialog
  },
  data() {
    // 验证规则
    const { isPassword } = this.$validator

    // 二次验证密码
    const checkPassWord2 = (rule, value, callback) => {
      if (value === this.form.newpassword) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    // 验证邮箱和手机号的验证规则
    const checkRegMail = (rule, value, callback) => {
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

      return callback(new Error('请输入合法的邮箱或手机号'))
    }

    return {
      btnLoading: false,
      // 同意协议
      agreementChecked: false,
      // 判断是邮箱注册还是手机号注册
      regType: 'mail',
      // 获取短信验证码按钮是否禁用
      btnIsDisabled: false,
      // 获取短信验证码按钮文字
      btnText: '获取验证码',

      form: {
        username: '',
        newpassword: '',
        password: '',
        code: ''
      },
      rules: {
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
        newpassword: [
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
        password: [
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
    // 后台是否禁用注册功能，true = 禁用
    isForbidRegister({ $root }) {
      const { register } = $root.webConfig.power

      return register === 1
    }
  },
  created() {},
  mounted() {},
  methods: {
    // 点击获取验证码，显示数字验证码对话框
    async showCaptchaDialog() {
      // 单独验证是否输入了手机号或者邮箱
      this.$refs.formRef.validateField('username', async (valid) => {
        // 如果没有输入则返回
        if (valid) return

        // 显示验证数字验证码对话框
        this.$refs.CaptchaDialogRef.showDialog(this.regType, this.form.username)
      })
    },

    // 重置登录密码提交
    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true
        try {
          const { username, code, password } = this.form
          const { data: res } = await resetPassword({
            [this.regType]: username,
            code,
            password
          })
          this.btnLoading = false

          this.$alert('重置登录密码成功，请牢记您的登录密码', '友情提示', {
            type: 'success',
            center: true,
            callback: (action) => {
              this.$router.replace('/login')
            }
          })
        } catch (error) {
          this.btnLoading = false
          throw error
        }
      })
    }
  }
}
</script>
