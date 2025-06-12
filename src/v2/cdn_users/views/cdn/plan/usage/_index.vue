<template>
  <horizontal-menu
    parent-path="/cdn/plan/usage/"
    :menu-list="menuList"
    title="用量查询"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '用量查询',
          path: 'query'
        }
        // {
        //   title: '用量汇总',
        //   path: 'bill'
        // }
      ]
    }
  }
}
</script>
