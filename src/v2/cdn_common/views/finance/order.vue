<template>
  <horizontal-menu
    parent-path="/cdn/finance/order/"
    :menu-list="menuList"
    :title="title"
    isFullPath
  />
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME

// 客户端菜单
const usersMenu = [
  {
    title: '已支付',
    path: '14'
  },
  {
    title: '待支付',
    path: '14?type=10'
  },
  {
    title: '充值记录',
    path: '14?type=2'
  },
  {
    title: '预付费',
    path: '14?type=30'
  },
  {
    title: '退款记录',
    path: '14?type=24'
  }
]

// 管理端菜单
const adminMenu = [
  ...usersMenu,
  {
    title: '待退款',
    path: '14?type=15'
  },
  {
    title: '实名认证',
    path: '14?type=1'
  }
]

export default {
  data() {
    return {
      menuList: PROCESS_NAME === 'cdn_admin' ? adminMenu : usersMenu,
      title: PROCESS_NAME === 'cdn_admin' ? '订单列表' : '我的订单'
    }
  },
  methods: {}
}
</script>
