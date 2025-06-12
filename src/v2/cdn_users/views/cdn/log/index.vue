
<template>
  <horizontal-menu
    parent-path="/cdn/log/"
    :menu-list="menuList"
    title="日志服务"
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
          title: '套餐日志',
          path: 'list?logType=3'
        },
        {
          title: '财务日志',
          path: 'list?logType=4'
        }
      ]
    }
  }
}
</script>
