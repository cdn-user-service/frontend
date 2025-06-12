<template>
  <horizontal-menu
    parent-path="/cdn/analysis/query/"
    :menu-list="menuList"
    title="请求查询"
  />
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME

const menuList =
  PROCESS_NAME === 'cdn_admin'
    ? [
        {
          title: '请求日志',
          path: 'access'
        },
        {
          title: '封禁日志',
          path: 'block'
        },
        {
          title: '错误日志',
          path: 'error'
        }
      ]
    : [
        {
          title: '请求日志',
          path: 'access'
        },
        {
          title: '封禁日志',
          path: 'block'
        }
      ]

export default {
  data() {
    return {
      menuList
    }
  },
  methods: {}
}
</script>
