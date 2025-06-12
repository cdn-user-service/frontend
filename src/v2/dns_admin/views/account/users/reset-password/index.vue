<template>
  <div class="user_password">
    <div class="userinfo_main animated fadeIn">
      <div class="avatar_box">
        <el-avatar :src="avatar" :size="80" fit="fill"></el-avatar>
        <div>
          <strong>{{ $root.userinfo.username }}</strong>
        </div>
      </div>

      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-position="top"
        status-icon
      >
        <ants-form-item label="原始密码" prop="password">
          <ants-input
            prefix-icon="aicon icon-mima1"
            v-model="form.password"
            type="password"
            placeholder="请输入原始密码"
          ></ants-input>
        </ants-form-item>
        <ants-form-item label="新的密码" prop="newPassword1">
          <ants-input
            prefix-icon="aicon icon-mima1"
            v-model="form.newPassword1"
            type="password"
            placeholder="请输入新的密码"
          ></ants-input>
        </ants-form-item>
        <ants-form-item label="确认密码" prop="newPassword">
          <ants-input
            prefix-icon="aicon icon-mima1"
            v-model="form.newPassword"
            type="password"
            placeholder="请输入确认密码"
          ></ants-input>
        </ants-form-item>
        <ants-form-item style="margin:30px 0 0;">
          <ants-button
            type="primary"
            style="width:100%;"
            :loading="btnLoading"
            @click="submitResetPassword()"
            text="确认修改"
          />
        </ants-form-item>
      </ants-form>
    </div>
  </div>
</template>

<script>
import { resetPassword } from '@/v2/dns_admin/api/account/user'

export default {
  data() {
    const checknewPassword = (rule, value, callback) => {
      if (value === this.form.newPassword1) {
        // 合法密码
        return callback()
      }
      callback(new Error('两次输入的密码不一致'))
    }
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
            message: '原始密码不能为空',
            trigger: 'blur'
          }
        ],
        newPassword1: [
          {
            required: true,
            message: '新密码不能为空',
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
            message: '确认密码不能为空',
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
  created() {},
  methods: {
    /**
     * @description: 修改密码提交
     */

    submitResetPassword() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        const { data: res } = await resetPassword({
          password: this.form.password,
          newPassword: this.form.newPassword
        })
        this.btnLoading = false

        if (res.code !== 1) {
          return this.$alert(
            '修改密码失败，请确认原始密码是否正确',
            '修改密码失败',
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
        this.$alert('修改密码成功，请重新登录', '友情提示', {
          type: 'success',
          center: true,
          callback: action => {
            this.$router.push('/login')
          }
        })
      })
    }
  }
}
</script>

<style lang="scss">
.user_password {
  .userinfo_main {
    .ants-form-item {
      margin-bottom: 10px;
    }
    .ants-form--label-top .ants-form-item__label {
      line-height: 30px;
    }
  }

  // 输入框样式重置
  .el-button {
    padding: 15px 20px;
    font-size: 16px;
  }

  .ants-input {
    .ants-input__inner {
      border: 2px solid theme('colors.ants-bg-5');
      background-color: theme('colors.ants-bg-5');
      border-radius: 6px;
      line-height: 56px;
      height: 56px;
      padding-left: 45px;
      color: #333;
    }

    .ants-input__prefix {
      left: 20px;
      top: 2px;
    }

    .ants-input__inner:focus {
      border-color: theme('colors.primary');
    }
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
