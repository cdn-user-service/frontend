import { $http, $qs } from '../../request'

// 获取订单列表
export function getOrderList(data) {
    return $http({
        url: 'sys/cdn/suit/order/list',
        method: 'post',
        data
    })
}

// 获取订单详情
export function getOrderDetail(params) {
    return $http({
        url: 'sys/cdn/pay/order/detail',
        method: 'get',
        params
    })
}

// 创建订单
export function doCreateOrder(data) {
    return $http({
        url: 'sys/cdn/suit/order/create',
        method: 'post',
        data
    })
}

// 删除订单
export function doDeleteOrder(params) {
  return $http({
    url: 'sys/cdn/suit/order/delete',
    method: 'get',
    params
  })
}

/**
 * @description: 创建后付费订单，主要用于 授权用户95带宽
 */
export function doCreatePostpaidOrder(data) {
    return $http({
        url: 'sys/cdn/suit/suit/create/postpaid',
        method: 'post',
        data
    })
}

// 人工充值
export function doAdminRecharge(data) {
    return $http({
        url: 'sys/cdn/pay/adminRecharge',
        method: 'post',
        data
    })
}
