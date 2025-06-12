<template>
    <el-form
      label-width="0px"
      class="space-y-10"
      :model="form"
      :rules="formRules"
      ref="formRef"
      method="post"
    >
      <ants-form-item prop="users">
        <ants-input
          is-bgc
          placeholder="请输入邮箱/账号"
          prefix-icon="aicon icon-yonghu-"
          v-model="form.users"
          maxlength="32"
          @keydown.enter.native="submitForm()"
        />
      </ants-form-item>
      <ants-form-item prop="password1">
        <ants-input
          is-bgc
          placeholder="请输入密码"
          prefix-icon="aicon icon-mima1"
          v-model="form.password1"
          show-password
          maxlength="32"
          @keydown.enter.native="submitForm()"
        />
      </ants-form-item>
      <ants-form-item prop="password">
        <ants-input
          is-bgc
          placeholder="请输入确认密码"
          prefix-icon="aicon icon-mima1"
          v-model="form.password"
          show-password
          maxlength="32"
          @keydown.enter.native="submitForm()"
        />
      </ants-form-item>
      <ants-form-item prop="captcha" class="ants-captcha_item">
        <ants-input
          is-bgc
          placeholder="验证码"
          prefix-icon="aicon icon-zhucedengluyanzhengma"
          v-model="form.captcha"
          @keydown.enter.native="submitForm()"
          maxlength="32"
        />
        <AntsCaptcha ref="AntsCaptchaRef"/>
      </ants-form-item>

      <ants-form-item style="margin-top:10px;">
        <el-checkbox v-model="agreementChecked">
          <span class="text-sm">
            {{ antsT('我已阅读并同意') }}
          </span>
        </el-checkbox>
        <span class="cursor_color text-primary text-sm" @click="showAgreementDialog"
          >《{{ $root.webName }} {{ antsT('服务协议') }}》</span
        >
      </ants-form-item>

      <ants-form-item style="margin-top:10px;">
        <ants-button
          type="primary"
          @click="submitForm"
          @keydown.enter="submitForm"
          :loading="btnLoading"
          class="text-2xl w-full"
          text="立即注册"
          />
      </ants-form-item>
      <AgreementDialog ref="AgreementDialogRef" />

    </el-form>
</template> 

<script>
// 验证规则
import { isTel, isEmail } from '@/utils/validate'
import AgreementDialog from '@/v2/cdn_users/components/AgreementDialog'
import { setToken } from '@/utils/auth'

export default {
  components: {
    AgreementDialog
  },
  data() {
    // 验证规则
    const { isPassword } = this.$validator

    // 验证注册账号
    const checkUsers = (rule, value, callback) => {
      const regValue = value.trim()

      const tel = isTel(regValue)
      const email = isEmail(regValue)

      if (!tel && !email) {
        return callback(new Error('注册账号需为邮箱或者手机号'))
      }

      // 判断注册类型
      if (email) {
        this.form.usersType = 2
      }
      if (tel) {
        this.form.usersType = 3
      }

      callback()
    }

    // 二次验证密码
    const checkPassWord2 = (rule, value, callback) => {
      if (value === this.form.password1) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    return {
      btnLoading: false,

      form: {
        users: '',
        usersType: 2, // 注册类型： 1 - 其他账号注册， 2 - 邮箱注册， 3 - 手机号注册
        password1: '',
        password: '',
        captcha: '',
        uuid: new Date().getTime()
      },
      formRules: {
        users: [
          {
            required: true,
            message: '请输入注册账号',
            trigger: ['change', 'blur']
          },
          {
            validator: checkUsers,
            trigger: 'blur'
          }
        ],
        password1: [
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
        ],
        captcha: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * @description: 查看同意协议
     */

    showAgreementDialog() {
      this.$refs.AgreementDialogRef.showDialog()
    },

    /**
     * @description: TODO： 普通账号注册提交
     */

    submitForm() {
      if (this.btnLoading) return
      // 表单与验证
      this.$refs.formRef.validate(async valid => {
        if (!valid) return

        if (!this.agreementChecked) {
          return this.$msg.error(
            `${this.antsT('请您阅读并同意')}《${
              this.$root.webName
            } ${this.antsT('服务协议')}》`
          )
        }

        // 判断是否可以执行该模块
        if (
          this.powerObj.wechat ||
          this.powerObj.mobile ||
          this.powerObj.mail
        ) {
          this.$router.push('/login')
          this.$msg.error('非法操作')
          return
        }

        const { data: res } = await this.$http.post('', this.form, {
          expect: 0
        })

        if (res.code !== 1) return

        // 注册成功，保存token到本地，前往控制台
        setToken(res.token, res.users)

        this.$msg.success(this.antsT('恭喜您已注册成功'))
        this.$router.push('/console')
      })
    }
  }
}
</script>
