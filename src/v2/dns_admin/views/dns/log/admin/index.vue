<template>
  <horizontal-menu
    parent-path="/dns/log/admin/"
    :menu-list="menuList"
    title="管理日志"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '登录日志',
          path: '0'
        },
        {
          title: '操作日志',
          path: '1'
        },
        {
          title: '产品日志',
          path: '2'
        },
        {
          title: '财务日志',
          path: '3'
        },
        {
          title: '其他日志',
          path: '-1'
        }
      ]
    }
  },
  methods: {}
}
</script>
