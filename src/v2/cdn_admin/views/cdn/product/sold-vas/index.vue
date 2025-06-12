
<template>
  <horizontal-menu
    parent-path="/cdn/product/sold-vas/"
    :menu-list="menuList"
    title="已售服务"
    v-bind="$attrs"
    isFullPath
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '使用中',
          path: 'list'
        },
        {
          title: '未使用',
          path: 'list?mode=2'
        },
        {
          title: '已过期',
          path: 'list?mode=3'
        }
        // {
        //   title: '已失效',
        //   path: '4'
        // }
      ]
    }
  }
}
</script>
