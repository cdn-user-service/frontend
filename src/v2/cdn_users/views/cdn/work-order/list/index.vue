<template>
  <horizontal-menu
    parent-path="/cdn/work-order/list/"
    :menu-list="menuList"
    title="工单列表"
    isFullPath
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: Object.freeze([
        {
          title: '处理中',
          path: 'status'
        },
        {
          title: '已结单',
          path: 'status?status=3'
        },
        {
          title: '处理完成',
          path: 'status?status=1'
        },
        {
          title: '申诉处理中',
          path: 'status?status=2'
        }
      ])
    }
  },
  methods: {}
}
</script>
