import { $http, $qs } from '../../request'

/**
 * @description: 申请使用95带宽套餐
 */
export function applyUseBandwith(params) {
  return $http({
    url: 'app/product/suit/create/postpaid',
    method: 'get',
    params
  })
}

/**
 * @description: 获取所有在售套餐列表，带分页的
 */
export function getPlanList(data) {
  return $http({
    url: 'app/product/product/list',
    method: 'post',
    data
  })
}

/**
 * @description: 根据类型获取所有可购套餐 productTypes
 */
export function getPlanAll(params) {
  return $http({
    url: 'app/product/product/all',
    method: 'get',
    params
  })
}

/**
 * @description: 目标套餐可升级的套餐 productId
 */
export function getCanUpdatePlanList(params) {
  return $http({
    url: 'app/product/product/can/update',
    method: 'get',
    params
  })
}

/**
 * @description: 获取用户已有套餐列表，带分页
 */
export function getPlanSuitList(data) {
  return $http({
    url: 'app/product/suit/list',
    method: 'post',
    data
  })
}

/**
 * @description: 获取用户已有套餐列表，不带分页
 */
export function getMyPlanAll(params) {
  return $http({
    url: 'app/product/suit/listbyuser',
    method: 'get',
    params
  })
}

/**
 * @description: 获取套餐详情 By serialNumber
 */
export function getPlanSuitDetail(params) {
  return $http({
    url: 'app/product/suit/detail',
    method: 'get',
    params
  })
}

/**
 * @description: 查询用户流量使用情况
 */
export function getPlanUsedFlow(data) {
  console.log('getPlanUsedFlow的data: ', data)
  return $http({
    url: 'app/product/user/suit/bytes/detail',
    method: 'post',
    data
  })
}

/**
 * @description: 删除套餐|注销套餐  SerialNumber
 */
export function doCancellationPlan(params) {
  return $http({
    url: 'app/product/suit/cancellation',
    method: 'get',
    params
  })
}

/**
 * @description: 后付费(95带宽、日峰值带宽)套餐清算  SerialNumber
 */
export function doLiquidationPlan(params) {
  return $http({
    url: 'app/product/suit/liquidation',
    method: 'get',
    params
  })
}
