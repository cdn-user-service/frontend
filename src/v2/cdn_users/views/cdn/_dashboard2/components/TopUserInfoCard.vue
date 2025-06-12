<template>
  <el-card class="mb-lg">
    <div class="flex items-center justify-between">
      <div class="flex align-center">
        <el-avatar :src="require('@/assets/img/avatar.png')" :size="46"></el-avatar>
        <div class="ml-lg">
          <div class="mb-xs">
            <span class="mr-xs">{{
              userInfo.username || username
            }}</span>
            <span
              class="el-icon-edit-outline cursor-color"
              @click="$router.push('/cdn/account/info')"
              style="vertical-align: middle;"
            ></span>
          </div>

          <el-popover
            v-if="userInfo.realnameStatus === 1"
            placement="top-start"
            trigger="hover"
          >
            <div class="text-sm">
              {{ antsT('您已完成个人实名认证，可正常使用') }}
              {{ $root.webName }} {{ antsT('服务，') }}
              <router-link to="/cdn/user/auth">{{
                antsT('查看详情')
              }}</router-link>
            </div>
            <span
              slot="reference"
              class="el-icon-success inline-block auth-tag text-sm"
            >
              {{ antsT('已实名') }}</span
            >
          </el-popover>

          <span
            class="el-icon-remove inline-block auth-tag text-sm error-auth-tag"
            @click="$router.push('/cdn/account/verification')"
            v-else
          >
            {{ antsT('未实名') }}</span
          >
        </div>
      </div>
      <div class="text-right">
        <div class="mb-xs">
          <el-tag size="small" type="primary">
            {{antsT('最后登录')}} ：{{ (new Date().getTime() / 1000) | dateFormat }}
          </el-tag>
        </div>
        <div>
          <el-tag size="small" type="success">
            IP ：127.1.1.1
          </el-tag>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
          username: 'test.demo'
      },
      loginType: Object.freeze({
        mobile: '手机号登录',
        mail: '邮箱登录',
        username: '账号登录',
        wechat: '微信登录'
      })
    }
  },
  created() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.auth-tag {
  color: #fefefe;
  background-color: #00c878;
  padding: 4px 8px;
  border-radius: 30px;
}
.error-auth-tag.auth-tag {
  background-color: #f52443;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    box-shadow: 0px 1px 6px 0px rgba(245, 36, 67, 0.6);
  }
}
</style>
