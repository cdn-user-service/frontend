<template>
  <div>
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
          :placeholder="'请输入' + showTitle"
          prefix-icon="aicon icon-yonghu-"
          v-model.trim="form.username"
          maxlength="32"
        />
      </ants-form-item>

      <ants-form-item prop="checkCode">
        <div class="flex items-center justify-between">
          <ants-input
            is-bgc
            placeholder="验证码"
            prefix-icon="aicon icon-zhucedengluyanzhengma"
            v-model="form.checkCode"
            maxlength="32"
          />
          <AntsCaptcha ref="AntsCaptchaRef" v-if="regType == 'username'" />
          <el-button
            v-else
            @click="showCaptchaDialog"
            type="info"
            class="ml-lg"
            style="padding:18px 15px;font-size:13px;"
            :disabled="btnIsDisabled || isRegistedLoading"
            >{{ antsT(btnText) }}</el-button
          >
        </div>
      </ants-form-item>

      <ants-form-item prop="newpassword">
        <ants-input
          is-bgc
          placeholder="请输入密码"
          prefix-icon="aicon icon-mima1"
          v-model.trim="form.newpassword"
          show-password
          maxlength="32"
        />
      </ants-form-item>
      <ants-form-item prop="password">
        <ants-input
          is-bgc
          placeholder="请输入确认密码"
          prefix-icon="aicon icon-mima1"
          v-model.trim="form.password"
          show-password
          maxlength="32"
        />
      </ants-form-item>

      <ants-form-item style="margin-top:10px;">
        <el-checkbox v-model="agreementChecked">
          <span class="text-sm">
            {{ antsT('我已阅读并同意') }}
          </span>
        </el-checkbox>
        <span
          class="cursor-color text-primary text-sm"
          @click="showAgreementDialog"
          >《{{ $root.webName }} {{ antsT('服务协议') }}》</span
        >
      </ants-form-item>

      <ants-form-item style="margin-top:10px;">
        <ants-button
          type="primary"
          @click="submitForm"
          @keydown.enter="submitForm"
          class="text-2xl w-full"
          :loading="btnLoading"
          text="立即注册"
        />
      </ants-form-item>
    </el-form>

    <CaptchaDialog
      ref="CaptchaDialogRef"
      :btn-text.sync="btnText"
      :btn-is-disabled.sync="btnIsDisabled"
    />

    <AgreementDialog ref="AgreementDialogRef" />
  </div>
</template>

<script>
// api
import { register, checkRegister } from '@/v2/cdn_users/api/login'

import CaptchaDialog from '@/v2/cdn_users/components/CaptchaDialog'

import AgreementDialog from '@/v2/cdn_users/components/AgreementDialog'

// 验证规则
import { isTel, isEmail } from '@/utils/validate'
import { setToken } from '@/utils/auth'

// 验证普通账号
const isName = val => {
  const reg = /^[a-zA-Z0-9]{6,32}$/
  return reg.test(val)
}

export default {
  name: 'RegisterMailMobile',
  components: {
    CaptchaDialog,
    AgreementDialog
  },
  props: {
    powerObj: {
      type: Object,
      default: () => {} 
    }
  },
  computed: {
    showTitle() {
      // let text = '邮箱'
      // if (this.powerObj.mail) {
      //   text = '邮箱'
      // }
      // if (this.powerObj.mobile) {
      //   text = '手机号'
      // }
      // if (this.powerObj.mobile && this.powerObj.mail) {
      //   text = '邮箱/手机号'
      // }
      return '邮箱/账号'
    }
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
      const { mobile, mail, common } = this.powerObj

      // 如果为普通账号注册
      if (common == 1 || isName(regValue)) {
        this.regType = 'username'
        return callback()
      }

      // 如果为手机号注册
      if (isTel(regValue) && mobile == 1) {
        this.regType = 'mobile'
        return callback()
      }

      // 如果为邮箱注册
      if (isEmail(regValue) && mail == 1) {
        this.regType = 'mail'
        return callback()
      }

      callback(new Error('邮箱/手机号/普通账号(数字字母组成6-32个字符)'))
      // if (mobile == 1 && mail == 1) {
      //   return callback(new Error('请输入合法的邮箱或手机号'))
      // }

      // if (mobile == 1) {
      //   return callback(new Error('请输入合法的手机号'))
      // }

      // if (mail == 1) {
      //   return callback(new Error('请输入合法的邮箱'))
      // }
    }

    // 验证手机号或邮箱是否已注册过
    const checkIsRegisted = (rule, value, callback) => {
      if (this.isRegisted) return callback(new Error('该账号已注册'))
      callback()
    }

    return {
      agreementChecked: false, // 同意协议
      btnLoading: false,
      // 判断是邮箱注册还是手机号注册，默认为普通账号注册
      regType: 'username',
      // 获取短信验证码按钮是否禁用
      btnIsDisabled: false,
      // 获取短信验证码按钮文字
      btnText: '获取验证码',

      // 是否已注册
      isRegisted: false,
      isRegistedLoading: false,

      form: {
        newpassword: '', // 密码
        password: '', // 确认密码
        username: '', // 账号
        checkCode: '' // 验证码
      },
      formRules: {
        username: [
          {
            required: true,
            message: '请输入注册账号',
            trigger: ['change', 'blur']
          },
          {
            validator: checkRegMail,
            trigger: 'blur'
          },
          {
            validator: checkIsRegisted,
            trigger: 'blur'
          }
        ],
        checkCode: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur']
          }
        ],
        newpassword: [
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

  created() {},
  mounted() {},
  methods: {
    /**
     * @description: 点击获取验证码，显示数字验证码对话框
     */

    async showCaptchaDialog() {
      // 验证手机号或邮箱是否已注册过
      this.isRegistedLoading = true
      const { data: res } = await checkRegister({
        user: this.form.username.trim()
      })
      this.isRegistedLoading = false
      if (res.code !== 1) return
      // 如果已注册
      if (res.data == 1) {
        this.$msg.error(this.antsT('该账号已注册'))
        this.isRegisted = true
      }

      // 单独验证是否输入了手机号或者邮箱
      this.$refs.formRef.validateField('username', async valid => {
        // 恢复
        this.isRegisted = false
        // 如果没有输入则返回
        if (valid) return

        // 显示验证数字验证码对话框
        this.$refs.CaptchaDialogRef.showDialog(this.regType, this.form.username)
      })
    },

    /**
     * @description: 注册提交
     */
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return

        if (!this.agreementChecked) {
          return this.$msg.error(
            `${this.antsT('请您阅读并同意')}《${
              this.$root.webName
            } ${this.antsT('服务协议')}》`
          )
        }

        this.btnLoading = true

        const { data: res } = await register({
          code: this.form.checkCode,
          [this.regType]: this.form.username,
          password: this.form.password,
          uuid: this.$refs.AntsCaptchaRef && this.$refs.AntsCaptchaRef.random // 随机数
        })

        if (res.code !== 1) {
          this.btnLoading = false
          if (this.regType === 'username') {
            this.$refs.AntsCaptchaRef &&
              this.$refs.AntsCaptchaRef.changeCaptcha()
            this.form.checkCode = ''
          }
          return
        }

        setTimeout(() => {
          this.btnLoading = false
        }, 3000)

        setToken(res.token, this.form.username)
        this.$msg.success(this.antsT('恭喜您已注册成功'))
        this.$router.push('/console')
      })
    },

    /**
     * @description: 查看同意协议
     */

    showAgreementDialog() {
      this.$refs.AgreementDialogRef.showDialog()
    }
  }
}
</script>
