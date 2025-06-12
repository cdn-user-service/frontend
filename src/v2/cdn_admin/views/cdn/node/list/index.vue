
<template>
  <horizontal-menu
    parent-path="/cdn/node/list/"
    :menu-list="menuList"
    title="节点列表"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '节点列表',
          path: 'set'
        },
        {
          title: '节点分组',
          path: 'group'
        }
      ]
    }
  }
}
</script>
