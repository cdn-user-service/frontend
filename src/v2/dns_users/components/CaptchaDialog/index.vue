<template>
  <el-dialog
    :title="antsT('请输入右边验证码')"
    :visible.sync="dialogVisible"
    width="450px"
    @close="resetForm"
    :close-on-click-modal="false"
    center
    append-to-body
    destroy-on-close
    top="30vh"
  >
    <el-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      status-icon
      @submit.native.prevent
    >
      <ants-form-item prop="captcha_code" class="ants-captcha_item">
        <ants-input
          is-bgc
          placeholder="验证码"
          prefix-icon="aicon icon-zhucedengluyanzhengma"
          v-model="form.captcha_code"
          maxlength="32"
          @keydown.enter.native="submitGetCode()"
        />
        <AntsCaptcha ref="AntsCaptchaRef" />
      </ants-form-item>
    </el-form>
    <span slot="footer">
      <ants-button
        size="small"
        type="info"
        @click="dialogVisible = false"
        text="取 消"
      />
      <ants-button
        size="small"
        type="primary"
        :loading="btnLoading"
        @click="submitGetCode()"
        text="确 定"
      />
    </span>
  </el-dialog>
</template>

<script>
import { getCode } from '@/v2/dns_users/api/login'

export default {
  name: 'CaptchaDialog',
  data() {
    return {
      dialogVisible: false,
      btnLoading: false,
      // 类型：手机号-还是邮箱
      regType: '',
      // 账号
      accountNumber: '',

      form: {
        captcha_code: ''
      },
      formRules: {
        captcha_code: [
          {
            required: true,
            message: '请输入右边验证码',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 对话框显示
     * regType  邮箱 = mail, sms = 短信
     * accountNumber 发送账号
     */

    showDialog(regType = '', accountNumber) {
      this.dialogVisible = true
      this.regType = regType
      this.accountNumber = accountNumber

      // 切换验证码
      this.$nextTick(() => {
        this.changeCode()
      })
    },

    // 切换验证码
    changeCode() {
      this.$refs.AntsCaptchaRef.changeCaptcha()
    },

    /**
     * @description: 获取验证码
     */

    submitGetCode() {
      if (this.btnLoading) return
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true

        this.updateParentData({
          btnText: this.antsT('正在发送'),
          btnIsDisabled: true
        })

        const { data: res } = await getCode(this.regType, {
          [this.regType]: this.accountNumber,
          uuid: this.$refs.AntsCaptchaRef.random,
          captcha_code: this.form.captcha_code
        })

        this.btnLoading = false

        if (res.code !== 1) {
          this.changeCode()
          this.updateParentData({
            // 获取验证码按钮文字
            btnText: this.antsT('重新获取'),
            // 按钮是否禁用
            btnIsDisabled: false
          })
          return
        }

        this.dialogVisible = false
        this.$msg.success(this.antsT('获取验证码成功'))

        // 设置60秒定时器
        let time = 60
        this.updateParentData({
          btnText: this.antsT('发送成功'),
          btnIsDisabled: true
        })

        const timer = setInterval(() => {
          time--

          this.updateParentData({
            // 获取验证码按钮文字
            btnText: time + this.antsT(' 秒后获取')
          })

          if (time === 0) {
            clearInterval(timer)
            this.updateParentData({
              btnText: this.antsT('重新获取'),
              btnIsDisabled: false
            })
          }
        }, 1000)

        // 清除定时器
        this.$once('hook:beforeDestroy', () => {
          clearInterval(timer)
        })
      })
    },

    /**
     * @description: 更新父组件传递过来的数据
     * @param {*} data
     */

    updateParentData(data = {}) {
      Object.keys(data).forEach(e => {
        this.$emit(`update:${e}`, data[e])
      })
    },

    /**
     * @description: 表单重置
     */

    resetForm() {
      this.btnLoading = false
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
