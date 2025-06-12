<template>
  <horizontal-menu
    parent-path="/dns/finance/order/"
    :menu-list="menuList"
    title="订单列表"
    :menu-obj="menuObj"
  />
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME

const menuList = [
  {
    title: '已支付',
    path: 'paid',
    // 支付状态
    status: '14,15,16',
    // 产品类型
    goodsType: '10,11,12,13,20,21'
  },
  {
    title: '待支付',
    path: 'unpaid',
    // 支付状态
    status: '10',
    // 产品类型
    goodsType: '10,11,12,13,20,21'
  },
  {
    title: '充值记录',
    path: 'recharge',
    // 支付状态
    status: '14',
    // 产品类型
    goodsType: '1'
  },

  // 退款为另外的接口和页面
  {
    title: '退款记录',
    path: 'refunded',
    // 退款状态
    status: '21,22,23,24'
  },
  {
    title: '待退款',
    path: 'refunding',
    // 退款状态
    status: '20'
  }
]

const menuObj = {}
menuList.forEach((item) => {
  menuObj[item.path] = item
})

export default {
  data() {
    return {
      menuList,
      menuObj
    }
  },
  computed: {
    // 当前订单的查询数据
    orderQuery({ $route }) {
      const { path } = $route.params
      return menuObj[path] || {}
    }
  }
}
</script>
