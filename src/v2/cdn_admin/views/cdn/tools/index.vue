<template>
  <horizontal-menu
    parent-path="/cdn/tools/node/"
    :menu-list="menuList"
    title="运维工具"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '节点连通测试',
          path: 'node'
        }
      ]
    }
  },
  methods: {}
}
</script>
