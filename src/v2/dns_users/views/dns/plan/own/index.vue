<template>
  <horizontal-menu
    parent-path="/dns/plan/own/"
    :menu-list="menuList"
    title="我的套餐"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '使用中',
          path: '1'
        },
        {
          title: '未使用',
          path: '2'
        },
        {
          title: '已过期',
          path: '3'
        },
        {
          title: '已失效',
          path: '4'
        }
      ]
    }
  }
}
</script>
