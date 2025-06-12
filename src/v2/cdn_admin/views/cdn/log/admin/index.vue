<template>
  <horizontal-menu
    parent-path="/cdn/log/admin/"
    :menu-list="menuList"
    title="管理日志"
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
          title: '调度日志',
          path: 'list?logType=5'
        },
        {
          title: '其他日志',
          path: 'list?logType=0'
        }
      ]
    }
  },
  methods: {}
}
</script>
