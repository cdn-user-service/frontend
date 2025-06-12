<template>
  <el-card class="mb-lg">
    <div slot="header" class="flex justify-between items-center">
      <strong>{{ antsT('基本信息') }}</strong>
      <span class="el-icon-more"></span>
    </div>
    <div class="flex items-center">
      <el-avatar
        :size="80"
        :src="require('@/assets/img/avatar.png')"
      ></el-avatar>
      <ul class="pl-lg">
        <li>
          <el-tag size="mini" type="primary">ID：{{ userinfo.userId }}</el-tag>
          <strong class="ml-sm">{{ userinfo.username }}</strong>
        </li>
        <li class="mt-df">
          <el-tag size="small" type="success"
            >{{ antsT('登录方式') }}：{{
              antsT(loginTypeObj[userinfo.loginType])
            }}</el-tag
          >
        </li>
      </ul>
    </div>

    <div class="my-lg p-lg border-ants-border-3 border rounded-2xl">
      <div class="flex justify-between items-center">
        <strong class="text-ants-text-3">{{ antsT('账户余额') }}</strong>
        <router-link to="/cdn/finance/recharge" class="text-sm"
          >{{ antsT('立即充值') }} ></router-link
        >
      </div>

      <div class="mt-lg flex items-center">
        <span
          class="aicon icon-yue h-20 w-20 flex items-center justify-center rounded-full text-4xl text-price"
          style="background:#FFF9EF;"
        ></span>
        <span class="text-price text-4xl ml-lg">{{
          userinfo.propertyBalance | priceFormat
        }}</span>
      </div>
    </div>

    <div
      class="p-lg border-ants-border-3 border rounded-2xl"
      v-if="isShowVerify"
    >
      <div class="flex justify-between items-center">
        <strong class="text-ants-text-3">{{ antsT('实名认证') }}</strong>
        <router-link to="/cdn/account/verification" class="text-sm">{{
          !userinfo.realnameStatus
            ? antsT('前往认证') + ' >'
            : antsT('查看详情') + ' >'
        }}</router-link>
      </div>

      <div class="mt-lg flex items-center">
        <span
          :style="{
            background: !userinfo.realnameStatus ? '#FCF2F2' : '#E6F7EC'
          }"
          class="h-20 w-20 flex items-center justify-center rounded-full text-4xl"
          :class="[
            'aicon',
            !userinfo.realnameStatus
              ? 'text-error icon-shouquan2'
              : 'text-success icon-chenggong1'
          ]"
        ></span>
        <span
          class="text-2xl ml-lg"
          :class="!userinfo.realnameStatus ? 'text-error' : 'text-success'"
          >{{
            !userinfo.realnameStatus ? antsT('未实名认证') : antsT('已实名认证')
          }}</span
        >
      </div>
    </div>
  </el-card>
</template>

<script>
const loginTypeObj = {
  username: '账号登录',
  mobile: '手机号登录',
  mail: '邮箱登录',
  wechat: '微信登录',
  wechat_reg_login: '微信登录'
}

export default {
  props: {
    userinfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loginTypeObj
    }
  },
  computed: {
    // 后台是否开启强制实名
    isShowVerify({ $root }) {
      const { realName } = $root.webConfig.power
      return realName == 1
    }
  },
  created() {},
  methods: {}
}
</script>
