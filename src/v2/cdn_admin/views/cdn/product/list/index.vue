<template>
  <horizontal-menu
    parent-path="/cdn/product/list/"
    :menu-list="menuList"
    title="产品列表"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '套餐管理',
          path: 'plan'
        },
        {
          title: '增值业务',
          path: 'vas'
        }
      ]
    }
  }
}
</script>
