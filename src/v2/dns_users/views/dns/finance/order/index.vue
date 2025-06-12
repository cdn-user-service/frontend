
<template>
  <horizontal-menu
    parent-path="/dns/finance/order/"
    :menu-list="menuList"
    title="我的订单"
  />
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        {
          title: '已支付',
          path: '14'
        },
        {
          title: '待支付',
          path: '10'
        },
        {
          title: '充值记录',
          path: '1'
        },
        {
          title: '退款记录',
          path: '24'
        }
      ]
    }
  }
}
</script>
