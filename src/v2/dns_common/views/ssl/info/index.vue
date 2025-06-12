
<template>
  <horizontal-menu
    parent-path="/dns/ssl/info/"
    :menu-list="menuList"
    title="信息管理"
  />
</template>

<script>
const menuList = [
  {
    title: '联系人',
    path: 'contact'
  },
  {
    title: '公司信息',
    path: 'company'
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
