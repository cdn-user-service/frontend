<template>
  <horizontal-menu
    parent-path="/cdn/site/cache-clear/"
    :menu-list="menuList"
    title="预热更新"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '清理缓存',
          path: 'clear'
        },
        // {
        //   title: '缓存预热',
        //   path: 'preheat'
        // },
        {
          title: '缓存预取',
          path: 'record'
        }
      ]
    }
  }
}
</script>
