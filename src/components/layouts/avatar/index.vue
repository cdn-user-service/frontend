<template>
  <el-dropdown
    trigger="hover"
    :show-timeout="100"
    @command="handleCommand"
    @visible-change="handleVisibleChange"
  >
    <div class="ants-avatar-box flex items-center cursor-color ">
      <el-avatar
        size="small"
        :src="require('@/assets/img/avatar.png')"
      ></el-avatar>
      <span class="hidden-md-and-down ml-3 username-box">{{ username }}</span>
      <span
        class="hidden-md-and-down el-icon-arrow-down"
        :class="{ 'dropdown-active': active }"
        style="margin-left:5px;"
      ></span>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        :icon="item.icon"
        :command="item.url"
        v-for="(item, idx) in dropdownMenu"
        :key="idx"
      >
        {{ antsT(item.name) }}</el-dropdown-item
      >
      <el-dropdown-item icon="el-icon-switch-button" divided command="/login">
        {{ antsT('退出登录') }}</el-dropdown-item
      >
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { removeToken, getUser } from '@/utils/auth'

const dropdownMenuObj = {
  // CDN 管理端
  cdn_admin: [
    // {
    //   name: '授权信息',
    //   icon: 'aicon icon-shouquan1',
    //   url: '/dns/auth'
    // },
    {
      name: '账户管理',
      icon: 'el-icon-user',
      url: '/account/users/users'
    },
    {
      name: '产品管理',
      icon: 'el-icon-goods',
      url: '/cdn/product/list'
    },
    {
      name: '人工充值',
      icon: 'el-icon-coin',
      url: '/cdn/finance/recharge'
    }
  ],
  cdn_users: [
    {
      name: '个人中心',
      icon: 'el-icon-user',
      url: '/cdn/account/info'
    },
    {
      name: '购买套餐',
      icon: 'el-icon-goods',
      url: '/cdn/plan/purchase'
    },
    {
      name: '余额充值',
      icon: 'el-icon-coin',
      url: '/cdn/finance/recharge'
    }
  ],
  dns_admin: [
    {
      name: '授权信息',
      icon: 'aicon icon-shouquan1',
      url: '/home/auth'
    },
    {
      name: '账户管理',
      icon: 'el-icon-user',
      url: '/account/users/users'
    },
    {
      name: '产品管理',
      icon: 'el-icon-goods',
      url: '/dns/plan/list'
    },
    {
      name: '人工充值',
      icon: 'el-icon-coin',
      url: '/dns/finance/recharge'
    }
  ],
  dns_users: [
    {
      name: '个人中心',
      icon: 'el-icon-user',
      url: '/dns/account/info'
    },
    {
      name: '购买套餐',
      icon: 'el-icon-goods',
      url: '/dns/plan/purchase'
    },
    {
      name: '余额充值',
      icon: 'el-icon-coin',
      url: '/dns/finance/recharge'
    },
    {
      name: 'API 密钥',
      icon: 'el-icon-key',
      url: '/dns/account/apikey'
    }
  ]
}
export default {
  name: 'AntsAvatar',
  data() {
    return {
      active: false,
      dropdownMenu: dropdownMenuObj[process.env.VUE_APP_NAME]
    }
  },
  computed: {
    username({ $root }) {
      return $root.userinfo.username || getUser() || '-'
    }
  },
  created() {},
  methods: {
    handleCommand(command) {
      // 退出登录
      if (command == '/login') {
        removeToken()
      }
      this.$router.push(command)
    },

    handleVisibleChange(val) {
      this.active = val
    }
  }
}
</script>

<style lang="scss" scoped>
.ants-avatar-box {
  height: 100%;
  .username-box {
    display: inline-block;
    max-width: 150px;
    font-size: 13px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .el-icon-arrow-down {
    transition: all 0.3s;
  }
  .dropdown-active {
    transform: rotate(180deg);
  }
}
</style>
