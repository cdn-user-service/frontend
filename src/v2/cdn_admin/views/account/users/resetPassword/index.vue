<template>
  <div class="user_password">
    <div class="userinfo_main animated fadeIn">
      <div class="avatar_box">
        <el-avatar :src="avatar" :size="70" fit="fill"></el-avatar>
        <div>
          <strong>{{ username }}</strong>
        </div>
      </div>

      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        space-class="space-y-3"
        label-position="top"
      >
        <ants-form-item
          label="原始密码"
          prop="password"
          style="margin-bottom:0;"
        >
          <ants-input
            is-bgc
            prefix-icon="aicon icon-mima1"
            v-model="form.password"
            type="password"
            placeholder="请输入原始密码"
          ></ants-input>
        </ants-form-item>
        <ants-form-item label="新的密码" prop="newPassword1">
          <ants-input
            is-bgc
            prefix-icon="aicon icon-mima1"
            v-model="form.newPassword1"
            type="password"
            placeholder="请输入新的密码"
          ></ants-input>
        </ants-form-item>
        <ants-form-item label="确认密码" prop="newPassword">
          <ants-input
            is-bgc
            prefix-icon="aicon icon-mima1"
            v-model="form.newPassword"
            type="password"
            placeholder="请输入确认密码"
          ></ants-input>
        </ants-form-item>
        <ants-form-item style="margin:30px 0 0;">
          <ants-button
            type="primary"
            class="w-full"
            :loading="btnLoading"
            @click="submitForm()"
            text="确认修改"
          />
        </ants-form-item>
      </ants-form>
    </div>
  </div>
</template>

<script>
import { getUser } from '@/utils/auth'
// API
import { resetPassword } from '@/v2/cdn_admin/api/account/admins'

export default {
  data() {
    const checknewPassword = (rule, value, callback) => {
      if (value === this.form.newPassword1) return callback()
      callback(new Error('两次输入的密码不一致'))
    }

    // 验证规则
    const { isPassword } = this.$validator

    return {
      avatar: require('@/assets/img/avatar.png'),
      btnLoading: false,
      form: {
        // 修改对话框的表单数据
        password: '',
        newPassword1: '',
        newPassword: ''
      },

      formRules: {
        // 修改分组对话框的规则
        password: [
          {
            required: true,
            message: '请输入原始密码',
            trigger: 'blur'
          }
        ],
        newPassword1: [
          {
            required: true,
            message: '请输入新的密码',
            trigger: 'blur'
          },
          {
            validator: isPassword(),
            trigger: 'blur'
          }
        ],
        newPassword: [
          {
            required: true,
            message: '请输入确认密码',
            trigger: 'blur'
          },
          {
            validator: checknewPassword,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    username({ $root }) {
      return $root.userinfo.username || getUser() || '-'
    }
  },
  created() {},
  methods: {
    /**
     * @description: 修改密码提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        const { password, newPassword } = this.form
        const { data: res } = await resetPassword({
          password,
          newPassword
        })
        this.btnLoading = false

        if (res.code !== 1) {
          return this.$alert(
            this.antsT('修改密码失败，请确认原始密码是否正确'),
            this.antsT('修改密码失败'),
            {
              type: 'error',
              center: true,
              callback: action => {
                this.$refs.formRef.resetFields()
              }
            }
          )
        }

        window.sessionStorage.clear()
        this.$alert(
          this.antsT('修改密码成功，请重新登录'),
          this.antsT('友情提示'),
          {
            type: 'success',
            center: true,
            callback: action => {
              this.$router.push('/login')
            }
          }
        )
      })
    }
  }
}
</script>
<style lang="scss">
.user_password {
  // 输入框样式重置
  .el-button {
    padding: 15px 20px;
    font-size: 15px;
  }
}
</style>
<style lang="scss" scoped>
.userinfo_main {
  max-width: 520px;
  margin: 20px auto;
  background-color: #fff;
  border-top: 3px solid theme('colors.primary');
  border-radius: 10px;
  padding: 30px 50px 50px;
  box-shadow: 0px 1px 15px 1px rgba(0, 0, 0, 0.05);

  @media screen and (max-width: 520px) {
    padding: 30px 20px;
  }
  .avatar_box {
    text-align: center;
    padding-bottom: 30px;
    strong {
      display: inline-block;
      font-size: 20px;
      margin-top: 10px;
    }
  }
}
</style>
