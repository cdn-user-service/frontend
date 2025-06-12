<template>
  <div>
    <el-dialog
      :title="antsT('验证已有账号')"
      :visible.sync="dialogVisible"
      width="450px"
      @close="resetForm"
      center
      top="20vh"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="text-center mb-xl">
        绑定您已有的{{ powerObj.text }}，之后可通过微信扫码登录
      </div>
      <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-position="top"
        status-icon
        class="space-y-12"
      >
        <ants-form-item prop="username">
          <ants-input
            is-bgc
            prefix-icon="aicon icon-yonghu-"
            v-model="form.username"
            :placeholder="powerObj.text"
          />
        </ants-form-item>
        <ants-form-item prop="code" class="code_box">
          <ants-input
            is-bgc
            prefix-icon="aicon icon-yanzhengma2"
            v-model="form.code"
            placeholder="验证码"
          />
          <el-button
            type="info"
            :disabled="btnIsDisabled"
            @click="showCaptchaDialog"
            class="ml-lg"
            style="padding:18px 15px;font-size:13px;"
            >{{ btnText }}</el-button
          >
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
          @click="submitBinding"
          text="确认绑定"
        />
      </span>

      <CaptchaDialog
        ref="CaptchaDialogRef"
        :btn-text.sync="btnText"
        :btn-is-disabled.sync="btnIsDisabled"
      />
    </el-dialog>
  </div>
</template>

<script>
import { wxbind } from '@/v2/dns_users/api/login'
import CaptchaDialog from '@/v2/dns_users/components/CaptchaDialog'
// 验证规则
import { isTel, isEmail } from '@/utils/validate'
import { setToken } from '@/utils/auth'

export default {
  components: {
    CaptchaDialog
  },
  props: {
    redirect: {
      type: String,
      default: '/console'
    }
  },

  data() {
    // 验证注册账号
    const checkUsers = (rule, value, callback) => {
      const regValue = value.trim()
      const tel = isTel(regValue)
      const email = isEmail(regValue)

      if (!email && !tel) {
        return callback(new Error('请输入合法的' + this.powerObj.text))
      }

      // 判断账号类型
      if (email && this.powerObj.mail == 1) {
        this.regType = 'mail'
      }
      if (tel && this.powerObj.mobile == 1) {
        this.regType = 'mobile'
      }

      callback()
    }

    return {
      // 判断是邮箱注册还是手机号注册
      regType: '',

      btnLoading: false,
      // 获取短信验证码按钮是否禁用
      btnIsDisabled: false,
      // 获取短信验证码按钮文字
      btnText: '获取验证码',
      dialogVisible: false,
      form: {
        username: '',
        openId: '',
        code: ''
      },
      formRules: {
        username: [
          {
            required: true,
            message: '请输入绑定账号',
            trigger: ['change', 'blur']
          },
          {
            validator: checkUsers,
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

      // 微信账户数据
      wxPostData: {
        nickname: '',
        openid: ''
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

      let text = '邮箱账号'
      if (mail) {
        text = '邮箱账号'
      }
      if (mobile) {
        text = '手机号'
      }
      if (mobile && mail) {
        text = '邮箱/手机号'
      }

      return { wechat, mobile, mail, text }
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     */

    showDialog(wxPostData = {}) {
      this.dialogVisible = true
      this.wxPostData = wxPostData
    },

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
     * @description: 绑定账号提交
     */
    submitBinding() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        const { data: res } = await wxbind({
          code: this.form.code,
          [this.regType]: this.form.username,
          openId: this.wxPostData.openid
        })

        this.btnLoading = false

        if (res.code !== 1) return

        // 绑定账号成功，保存token 直接跳转到控制台
        setToken(res.data)
        window.sessionStorage.setItem('lt', new Date().getTime())
        this.dialogVisible = false
        this.$msg.success('恭喜您已注册成功')

        if (this.redirect.startsWith('/')) {
          this.$router.replace(this.redirect)
        } else {
          // 外部地址, 判断是否携带了参数，追加 token到 url
          const query = this.redirect.split('?')[1]
          const contactStr = query ? '&' : '?'
          location.replace(this.redirect + `${contactStr}token=${res.data}`)
        }
      })
    },

    // 绑定已有账号，表单重置
    resetForm() {
      this.btnLoading = false
      this.$refs.formRef.resetFields()
    }
  }
}
</script>

<style lang="scss">
.code_box {
  .el-form-item__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
