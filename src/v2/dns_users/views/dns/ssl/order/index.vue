
<template>
  <horizontal-menu
    parent-path="/dns/ssl/order/"
    :menu-list="menuList"
    title="证书管理"
  />
</template>

<script>
const menuList = [
  {
    title: '付费证书',
    path: 'paid'
  },
  {
    title: '免费证书',
    path: 'free'
  }
]
export default {
  data() {
    return {
      menuList
    }
  }
}
</script>
