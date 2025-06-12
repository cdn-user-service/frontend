<template>
  <horizontal-menu
    parent-path="/system/config/verification/"
    :menu-list="menuList"
    title="实名配置"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '腾讯人脸核身',
          path: 'wechat'
        },
        {
          title: '支付宝实人认证',
          path: 'ali'
        }
      ]
    }
  },
  methods: {}
}
</script>
