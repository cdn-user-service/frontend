<template>
  <div class="content-box">
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 10 }"
        :md="{ span: 8 }"
        :lg="{ span: 6 }"
        :xl="{ span: 6 }"
      >
        <el-card>
          <!-- <template #header>
            <strong style="font-size: 16px"> 管理员信息 </strong>
          </template> -->
          <el-skeleton :rows="8" :loading="loading" animated>
            <template>
              <div class="flex items-center">
                <el-avatar
                  :src="avatar"
                  :size="50"
                  fit="fill"
                  class="border-2 border-white"
                  style="box-shadow: 0 0 15px rgba(0, 0, 0, 0.2)"
                />
                <div class="ml-lg">
                  <div>
                    <strong>{{ userinfo.username }}</strong>
                  </div>
                  <div class="mt-sm flex items-center">
                    ID：<strong>{{ userinfo.userId }}</strong>
                  </div>
                </div>
              </div>

              <ul class="pt-lg">
                <li
                  v-for="(item, key) in {
                    createTime: '创建时间',
                    email: '邮箱',
                    mobile: '手机号',
                    whiteIpStatus: '登录白名单',
                    googleAuthSecretKey: 'Google Authenticator',
                    resetPassword: '登录密码'
                  }"
                  :key="key"
                  class="border-ants-border-4 border-t py-df flex items-center justify-between"
                >
                  <span class="text-ants-text-4">{{ item }}</span>

                  <div>
                    <template v-if="key === 'whiteIpStatus'">
                      <span
                        v-if="userinfo.whiteIpStatus == 1"
                        class="text-success"
                      >
                        <i class="el-icon-success"></i>
                        已开启
                      </span>

                      <span v-else class="text-warning">
                        <i class="el-icon-remove"></i>
                        已关闭
                      </span>
                    </template>

                    <span
                      v-else-if="key === 'resetPassword'"
                      class="cursor-color text-primary"
                      @click="toResetPassword()"
                    >
                      <i class="el-icon-edit"></i>
                      修改
                    </span>

                    <template v-else-if="key === 'googleAuthSecretKey'">
                      <span
                        @click="toGoogleLogin()"
                        v-if="!userinfo.googleAuthSecretKey"
                        class="cursor-color text-primary"
                      >
                        <i class="el-icon-plus"></i>
                        绑定
                      </span>
                      <ants-table-switch
                        v-else
                        v-model="userinfo.googleAuthStatus"
                        inactive-color="#DCDFE6"
                        active-color="#13ce66"
                        @change="changeGoogleAuthStatus"
                      />
                    </template>

                    <span v-else>{{ userinfo[key] || '-' }}</span>
                  </div>
                </li>
              </ul>
            </template>
          </el-skeleton>
        </el-card>
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 14 }"
        :md="{ span: 16 }"
        :lg="{ span: 18 }"
        :xl="{ span: 18 }"
      >
        <el-card>
          <template #header>
            <strong style="font-size: 16px"> 登录日志 </strong>
          </template>

          <LoginLog ref="LoginLogRef" v-loading="loading" />
        </el-card>
      </el-col>
    </el-row>

    <ResetPassword ref="ResetPasswordRef" />

    <GoogleLoginBind @getUserData="getUserinfo" ref="GoogleLoginBindRef" />
  </div>
</template>

<script>
import { googleStatus } from '@/v2/cdn_admin/api/login'
import { getAdminInfo } from '@/v2/cdn_admin/api/account/admins'
import LoginLog from './LoginLog'
import ResetPassword from './ResetPasswordDialog'
import GoogleLoginBind from './GoogleLoginBind'

export default {
  components: { LoginLog, ResetPassword, GoogleLoginBind },
  data() {
    return {
      avatar: require('@/assets/img/avatar.png'),
      userinfo: {
        userId: '',
        username: '',
        whiteIpStatus: 0,
        createTime: '',
        email: '',
        mobile: '',
        whiteIpStatus: '',
        googleAuthSecretKey: '',
        googleAuthStatus: 0
      }
    }
  },
  created() {
    this.getUserinfo()
  },
  methods: {
    // 获取当前登录账号信息
    async getUserinfo() {
      this.loading = true
      try {
        const { data: res } = await getAdminInfo()
        const { user = {} } = res || {}
        this.userinfo = {
          ...this.userinfo,
          ...user
        }

        if (this.userinfo.username) {
          this.$refs.LoginLogRef.getTableData(this.userinfo.username)
        }
      } finally {
        this.loading = false
      }
    },

    toGoogleLogin() {
      this.$refs.GoogleLoginBindRef.showDialog()
    },

    toResetPassword() {
      this.$refs.ResetPasswordRef.showDialog()
    },

    // 打开-关闭谷歌验证
    async changeGoogleAuthStatus(status = 0) {
      const txt = status === 1 ? '开启' : '关闭'
      this.$confirm(
        `此操作将${txt} Google Authenticator 登录验证，是否继续？`,
        `${txt} Google Authenticator 登录验证`,
        {
          dangerouslyUseHTMLString: true,
          center: true,
          type: 'info',
          confirmButtonText: `确认${txt}`,
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '加载中...'

              try {
                const { data: res } = await googleStatus({
                  status
                })

                if (res.code !== 1) {
                  instance.confirmButtonText = '重试'
                  return
                }

                instance.confirmButtonText = `${txt}成功`
                this.$msg.success(`${txt}成功`)
                // 重新获取用户信息
                this.getUserinfo()
                done()
              } finally {
                instance.confirmButtonLoading = false
              }
            } else {
              done()
              this.userinfo.googleAuthStatus = status ? 0 : 1
            }
          }
        }
      ).catch((err) => err)
    }
  }
}
</script>
<style lang="scss"></style>
<style lang="scss" scoped></style>
