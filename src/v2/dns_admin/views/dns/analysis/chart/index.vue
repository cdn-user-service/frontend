<template>
  <horizontal-menu
    parent-path="/dns/analysis/chart/"
    :menu-list="menuList"
    title="图表分析"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
       {
          title: '时段分析',
          path: 'time'
        },
        {
          title: '来源地域',
          path: 'orign'
        }
      ]
    }
  },
  methods: {}
}
</script>
