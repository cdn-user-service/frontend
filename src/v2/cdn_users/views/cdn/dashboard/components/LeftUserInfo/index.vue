<template>
  <el-card class="mb-lg">
    <div class="flex items-center justify-between">
      <div class="flex align-center">
        <el-avatar
          :src="require('@/assets/img/avatar.png')"
          :size="56"
        />
        <div class="pl-lg flex-1">
          <div class="pb-2">
            <span>{{ antsT('您好，') }}</span>
            <strong class="mr-xs">{{ userinfo.username }}</strong>
            <span
              class="el-icon-edit-outline cursor-color"
              @click="$router.push('/cdn/account/info')"
              style="vertical-align: middle;"
            ></span>
          </div>

          <div class="text-xs">
            <span class="auth-tag mr-sm">
              <i class="el-icon-user" />
              {{ antsT('账号ID') }}：{{ userinfo.userId }}</span
            >

            <el-popover
              v-if="isShowVerify && userinfo.realnameStatus === 1"
              placement="top-start"
              trigger="hover"
            >
              <div class="text-sm">
                {{ antsT('您已完成个人实名认证，可正常使用') }}
                {{ $root.webName }} {{ antsT('服务，') }}
                <router-link to="/cdn/account/verification">{{
                  antsT('查看详情')
                }}</router-link>
              </div>
              <span slot="reference" class="auth-tag success-auth-tag mr-sm">
                <i class="el-icon-success" />
                {{ antsT('已实名') }}</span
              >
            </el-popover>

            <span
              class="auth-tag error-auth-tag mr-sm"
              @click="$router.push('/cdn/account/verification')"
              v-else-if="isShowVerify && userinfo.realnameStatus == 0"
            >
              <i class="el-icon-remove" />
              {{ antsT('未实名') }}</span
            >

            <span
              class="auth-tag info-auth-tag"
              @click="$router.push('/cdn/finance/recharge')"
            >
              <i class="el-icon-coin" />
              {{ antsT('余额') }}：{{
                userinfo.propertyBalance | priceFormat
              }}</span
            >
          </div>
        </div>
      </div>
      <div class="text-right hidden-xs-only">
        <div class="mb-xs">
          <el-tag size="small" type="primary">
            {{ antsT('最后登录') }} ：{{ lastLoginLog.createDate }}
          </el-tag>
        </div>
        <div>
          <el-tag size="small" type="success">
            IP ：{{ lastLoginLog.ip }}
          </el-tag>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  props: {
    lastLoginLog: Object
  },
  data() {
    return {
      loginType: Object.freeze({
        mobile: '手机号登录',
        mail: '邮箱登录',
        username: '账号登录',
        wechat: '微信登录'
      })
    }
  },
  computed: {
    userinfo({ $root }) {
      return $root.userinfo || {}
    },

    // 后台是否开启强制实名
    isShowVerify({ $root }) {
      const { realName } = $root.webConfig.power
      return realName == 1
    }
  },
  created() {
    this.$root.getUserinfo()
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.auth-tag {
  display: inline-block;
  margin-top: 10px;
  padding: 5px 10px;
  height: 28px;
  color: #fefefe;
  background-color: theme('colors.primary');
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid;
  border-color: theme('colors.primary');

  i {
    font-size: 15px;
  }

  &.success-auth-tag {
    background-color: theme('colors.success');
    border-color: theme('colors.success');
    &:hover {
      box-shadow: 0px 1px 6px 0px rgba(2, 179, 64, 0.6);
    }
  }

  &.info-auth-tag {
    background-color: theme('colors.ants-text-4');
    border-color: theme('colors.ants-text-4');
    &:hover {
      box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.6);
    }
  }

  &.error-auth-tag {
    background-color: theme('colors.error');
    border-color: theme('colors.error');
    &:hover {
      box-shadow: 0px 1px 6px 0px rgba(245, 37, 68, 0.6);
    }
  }

  &.price-auth-tag {
    background-color: #fff;
    color: theme('colors.price');
    border-color: theme('colors.price');
    &:hover {
      box-shadow: 0px 1px 6px 0px rgba(255, 122, 34, 0.6);
    }
  }
}
</style>
