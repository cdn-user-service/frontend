import { $http, $qs } from '../../request'

/**
 * @description: 获取订单列表
 */
export function getOrderList(data) {
    return $http({
        url: 'app/product/order/list',
        method: 'post',
        data
    })
}

/**
 * @description: 创建订单
 */
export function doCreateOrder(data) {
    return $http({
        url: 'app/product/order/create',
        method: 'post',
        data
    })
}

// 删除订单
export function doDeleteOrder(params) {
  return $http({
    url: 'app/product/order/delete',
    method: 'get',
    params
  })
}

/**
 * @description: 查询订单详情
 */
 export function getOrderDetail(params) {
    return $http({
        url: 'app/pay/order/detail',
        method: 'get',
        params
    })
}
