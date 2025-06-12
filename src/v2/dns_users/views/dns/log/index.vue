<template>
  <horizontal-menu
    parent-path="/dns/log/list/"
    :menu-list="menuList"
    title="日志服务"
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
          title: '套餐日志',
          path: '2'
        },
        {
          title: '财务日志',
          path: '3'
        },
        {
          title: 'ddns日志',
          path: '4'
        },
        {
          title: '其他日志',
          path: '-1'
        }
      ]
    }
  }
}
</script>
