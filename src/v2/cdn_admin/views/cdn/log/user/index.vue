
<template>
  <horizontal-menu
    parent-path="/cdn/log/user/"
    :menu-list="menuList"
    title="用户日志"
    isFullPath
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '登录日志',
          path: 'list'
        },
        {
          title: '操作日志',
          path: 'list?logType=2'
        },
        {
          title: '产品日志',
          path: 'list?logType=3'
        },
        {
          title: '财务日志',
          path: 'list?logType=4'
        },
        {
          title: '其他日志',
          path: 'list?logType=0'
        }
      ]
    }
  }
}
</script>
