import { $http, $qs } from '../../request'

// 获取订单列表
export function getOrderList(data) {
  return $http({
    url: 'sys/finance/order/list',
    method: 'post',
    data
  })
}

// 删除订单
export function doDelOrder(data) {
  return $http({
    url: 'sys/finance/order/delete',
    method: 'post',
    data
  })
}

// 人工充值
export function doRecharge(params) {
  return $http({
    url: 'sys/finance/product/adminRecharge',
    method: 'get',
    params
  })
}

// 人工充值后创建订单
export function createOrderInfo(orderId) {
  return $http({
    url: `sys/finance/order/info/${orderId}`,
    method: 'get'
  })
}

// 查询用户退款订单
export function getRefundList(data) {
    return $http({
      url: 'sys/finance/order/refund/list',
      method: 'post',
      data
    })
}

// 后台执行退款
export function doRefund(data) {
    return $http({
      url: 'sys/finance/order/refund',
      method: 'post',
      data
    })
}
