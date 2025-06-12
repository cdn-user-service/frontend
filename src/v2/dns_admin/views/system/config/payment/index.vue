<template>
  <horizontal-menu
    parent-path="/system/config/payment/"
    :menu-list="menuList"
    title="支付配置"
  />
</template>

<script>
const menuList = [
  {
    title: '微信支付',
    path: 'wechat'
  },
  {
    title: '支付宝支付',
    path: 'alipay'
  }
  // {
  //   title: '彩虹易支付',
  //   path: 'cccyun'
  // }
]

export default {
  data() {
    return {}
  },
  computed: {
    menuList() {
      const list = [...menuList]
      if (this.$mode['176_179']) {
        list.push(
          {
            title: 'Stripe支付',
            path: 'stripe'
          },
          {
            title: 'TokenPay支付',
            path: 'tokenpay'
          }
        )
      } else if (this.$mode.permission('tokenpay')) {
        list.push({
          title: 'TokenPay支付',
          path: 'tokenpay'
        })
      }
      return list
    }
  },
  methods: {}
}
</script>
