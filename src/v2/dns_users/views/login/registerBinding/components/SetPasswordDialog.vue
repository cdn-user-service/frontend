<template>
  <el-dialog
    :title="antsT('设置登录密码')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="dialogVisible"
    @close="resetForm"
    width="450px"
    top="20vh"
    append-to-body
    center
  >
    <div class="px-lg">
      <div class="text-center mb-xl">
        {{ antsT('需设置登录密码，作为安全验证') }}
      </div>
      <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-position="top"
        status-icon
        class="space-y-12"
      >
        <ants-form-item prop="password1">
          <ants-input
            is-bgc
            prefix-icon="aicon icon-mima1"
            v-model.trim="form.password1"
            type="password"
            placeholder="设置登录密码"
          />
        </ants-form-item>
        <ants-form-item prop="passwd">
          <ants-input
            is-bgc
            prefix-icon="aicon icon-mima1"
            v-model.trim="form.passwd"
            type="password"
            placeholder="再次确认密码"
          />
        </ants-form-item>
      </el-form>
      <ants-button
        class="text-2xl w-full my-xl"
        type="primary"
        @click="setPasswdSub"
        :loading="btnLoading"
        text="确认设置"
      />
    </div>
  </el-dialog>
</template>

<script>
import { wxnew, setPassword } from '@/v2/dns_users/api/login'
import { setToken } from '@/utils/auth'

export default {
  props: {
    redirect: {
      type: String,
      default: '/console'
    }
  },
  data() {
    // 验证规则
    const { isPassword } = this.$validator

    // 验证登录密码
    const checkPassWord2 = (rule, value, callback) => {
      if (value === this.form.password1) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }

    return {
      // 绑定现有账号
      formRules: {
        password1: [
          {
            required: true,
            message: '请输入登录密码',
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
      },

      // 设置登录密码
      btnLoading: false,
      dialogVisible: false,
      form: {
        password1: '',
        passwd: ''
      },

      // 微信账户数据
      wxPostData: {
        nickname: '',
        openid: ''
      }
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
     * @description: 选择注册新账号，设置登录密码
     */
    setPasswdSub() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        const { nickname, openid } = this.wxPostData
        const { data: res } = await wxnew({
          nickname,
          openid
        })

        if (res.code !== 1) {
          this.btnLoading = false
          return
        }

        // 将token 存入到 本地，以便进入控制台获取用户信息
        setToken(res.data)
        window.sessionStorage.setItem('lt', new Date().getTime())

        // 设置登录密码
        const { data: res1 } = await setPassword({
          pwd: this.form.passwd
        })

        this.btnLoading = false
        if (res1.code !== 1) return

        // 注册成功，前往后台
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

    // 设置登录密码，表单重置
    resetForm() {
      this.btnLoading = false
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
