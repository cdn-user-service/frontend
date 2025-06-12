<template>
  <el-card class="mb-lg">
    <div class="flex items-center justify-between">
      <div class="flex align-center">
        <el-avatar
          :src="require('@/assets/img/avatar.png')"
          :size="50"
        ></el-avatar>
        <div class="ml-lg">
          <div class="mb-sm">
            <span>{{ antsT('您好，') }}</span>
            <strong class="mr-xs">{{ userinfo.username }}</strong>
            <span
              class="el-icon-edit-outline cursor-color"
              @click="$router.push('/dns/account/info')"
              style="vertical-align: middle;"
            ></span>
          </div>
          <span class="mr-xs inline-block auth-tag text-sm primary-auth-tag"
            >ID：{{ userinfo.userId }}</span
          >

          <el-popover
            v-if="isShowVerify && userinfo.realnameStatus === 1"
            placement="top-start"
            trigger="hover"
          >
            <div class="text-sm">
              {{ antsT('您已完成个人实名认证，可正常使用') }}
              {{ $root.webName }} {{ antsT('服务，') }}
              <router-link to="/dns/account/verification">{{
                antsT('查看详情')
              }}</router-link>
            </div>
            <span
              slot="reference"
              class="el-icon-success inline-block auth-tag text-sm mr-xs"
            >
              {{ antsT('已实名') }}</span
            >
          </el-popover>

          <span
            class="el-icon-remove inline-block auth-tag text-sm error-auth-tag mr-xs"
            @click="$router.push('/dns/account/verification')"
            v-else-if="isShowVerify && userinfo.realnameStatus == 0"
          >
            {{ antsT('未实名') }}</span
          >

          <span
            class="el-icon-coin inline-block auth-tag text-sm price-auth-tag"
            @click="$router.push('/dns/finance/recharge')"
          >
            {{ antsT('余额') }}：{{
              userinfo.propertyBalance | priceFormat
            }}</span
          >
        </div>
      </div>
      <div class="text-right hidden-xs-only">
        <div class="mb-xs">
          <el-tag size="small" type="primary">
            {{ antsT('最后登录') }} ：{{ new Date() | dateFormat }}
          </el-tag>
        </div>
        <div>
          <el-tag size="small" type="success" class="mr-sm">
            {{ antsT(loginType[userinfo.loginType]) }}
          </el-tag>
          <el-tag size="small" type="success">
            IP：{{ lastLoginLog.ip || '127.0.0.1' }}
          </el-tag>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  props: {
    lastLoginLog: {
      type: Object,
      default: () => ({})
    },
    userinfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loginType: {
        mobile: '手机号登录',
        mail: '邮箱登录',
        username: '账号登录',
        wechat: '微信登录'
      }
    }
  },
  computed: {
    // userinfo({ $root }) {
    //   return $root.userinfo || {}
    // },

    // 后台是否开启强制实名
    isShowVerify({ $root }) {
      const { realName } = $root.webConfig.power
      return realName == 1
    }
  },
  created() {
    // this.$root.getUserinfo()
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.auth-tag {
  height: 24px;
  line-height: 24px;
  color: #fefefe;
  background-color: #00c878;
  padding: 0 10px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  vertical-align: middle;
}
.error-auth-tag.auth-tag {
  background-color: #f52443;
  &:hover {
    box-shadow: 0px 1px 6px 0px rgba(245, 36, 67, 0.6);
  }
}
.price-auth-tag.auth-tag {
  background-color: #fff;
  color: theme('colors.price');
  border: 1px solid theme('colors.price');
  &:hover {
    box-shadow: 0px 1px 6px 0px rgba(255, 122, 34, 0.6);
  }
}
.primary-auth-tag.auth-tag {
  background-color: theme('colors.primary');
}
</style>
