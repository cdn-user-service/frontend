<template>
  <horizontal-menu
    parent-path="/dns/domain/list/"
    :menu-list="menuList"
    title="我的域名"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '域名列表',
          path: 'list'
        },
        {
          title: '分组管理',
          path: 'group'
        }
      ]
    }
  }
}
</script>
