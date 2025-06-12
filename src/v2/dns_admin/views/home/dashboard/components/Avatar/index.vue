<template>
  <el-card>
    <el-row :gutter="20" align="middle">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <div class="flex items-center">
          <el-avatar
            :src="avatar"
            :size="50"
            fit="fill"
            class="border-2 border-white"
            style="box-shadow: 0 0 15px rgba(0,0,0,0.2);"
          ></el-avatar>

          <div class="ml-lg">
            <div>
              {{ antsT('您好，') }}
              <strong class="text-primary">{{ username }}</strong>
              <span
                class="el-icon-edit-outline cursor-color ml-sm align-middle"
                @click="$router.push('/account/users/admins')"
              ></span>
            </div>
            <div class="mt-sm flex items-center">
              ID：<strong>{{ lastLoginInfo.userId }}</strong>
              <el-divider direction="vertical"></el-divider>
              {{ antsT('超级管理员') }}
            </div>
          </div>
        </div>
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <div class="last-login-info text-right">
          <div>
            <el-tag size="small" type="primary">
              {{ antsT('最后登录') }} : {{ lastLoginInfo.createDate }}
            </el-tag>
          </div>
          <div class="mt-sm text-success">
            <el-tag size="small" type="success">
              IP : {{ lastLoginInfo.ip }}
            </el-tag>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { getUser } from '@/utils/auth'
// API
import { getManagerLogList } from '@/v2/dns_admin/api/dns/log'

export default {
  data() {
    return {
      avatar: require('@/assets/img/avatar.png'),
      loading: false,
      lastLoginInfo: {
        createDate: '',
        ip: '',
        area: '',
        id: 0
      }
    }
  },
  computed: {
    username({ $root }) {
      return $root.userinfo.username || getUser() || '--'
    }
  },
  created() {
    this.getLastLoginInfo()
  },
  methods: {
    /**
     * @description: 获取最后一次登录信息
     */

    async getLastLoginInfo() {
      this.loading = true
      try {
        const { data: res } = await getManagerLogList({
          method: 'login',
          user_type: 1,
          log_type: 0,
          username: this.username,
          page: 1,
          limit: 1
        })
        this.loading = false
        if (res.code !== 1) return
        const obj = res.page || {}
        this.lastLoginInfo = obj.list[0] || {}
      } catch (error) {
        this.loading = false
        throw error
      }
    }
  }
}
</script>
