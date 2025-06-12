<template>
  <horizontal-menu
    parent-path="/dns/account/domainLicense/"
    :menu-list="menuList"
    title="域名授权"
    :menu-obj="menuObj"
  />
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME

const menuList = [
  {
    title: '接收域名授权',
    path: 'receive'
  },
  {
    title: '发起域名授权',
    path: 'initiate'
  }
]

const menuObj = {}
menuList.forEach((item) => {
  menuObj[item.path] = item
})

export default {
  data() {
    return {
      menuList,
      menuObj
    }
  },
  computed: {
    // 当前订单的查询数据
    // orderQuery({ $route }) {
    //   const { path } = $route.params
    //   return menuObj[path] || {}
    // }
  }
}
</script>
