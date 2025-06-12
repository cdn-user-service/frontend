<template>
  <horizontal-menu
    parent-path="/dns/black/config/"
    :menu-list="menuList"
    title="拦截设置"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '黑名单域名',
          path: 'domains'
        },
        {
          title: '黑名单设置',
          path: 'setting'
        }
      ]
    }
  },
  methods: {}
}
</script>
