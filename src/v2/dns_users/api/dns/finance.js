import { $http, $qs } from '../../request'

// 余额充值
export function recharge(data) {
    return $http({
        url: 'app/product/balance/recharge',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 用户订单列表
// 包括已支付 status = 14、待支付 status = 10、退款 status= 24
export function getOrderList(data) {
    return $http({
        url: 'app/pay/queryUserOrder',
        method: 'post',
        data
    })
}

// 删除订单
export function doDelOrder(data) {
  return $http({
    url: 'app/pay/order/delete',
    method: 'post',
    data
  })
}

// 查询用户退款订单
export function getRefundList(data) {
    return $http({
      url: 'app/pay/refund/list',
      method: 'post',
      data
    })
}

// 申请退款
export function applyRefund(data) {
    return $http({
      url: 'app/product/order/refund',
      method: 'post',
      data
    })
}
