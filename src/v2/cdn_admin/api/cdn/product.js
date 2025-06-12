import { $http, $qs } from '../../request'

// 获取产品列表
export function getProductList(data) {
  return $http({
    url: 'sys/cdn/suit/product/list',
    method: 'post',
    data
  })
}

// 根据类型获取所有产品列表，不带分页, productTypes = '10,11,12,13...'
export function getProductAll(params) {
  return $http({
    url: 'sys/cdn/suit/product/all',
    method: 'get',
    params
  })
}

// 保存 and 修改产品
export function doCreateUpdateProduct(data) {
  return $http({
    url: 'sys/cdn/suit/product/save',
    method: 'post',
    data
  })
}

// 删除产品
export function doDeleteProduct(params) {
  return $http({
    url: 'sys/cdn/suit/product/delete',
    method: 'get',
    params
  })
}

/* =====================================
 *       产品属性相关
 *  =====================================
 */
// 获取产品属性列表，带分页
export function getProductAttrList(data) {
  return $http({
    url: 'sys/cdn/suit/productAttr/list',
    method: 'post',
    data
  })
}

// 获取所有产品属性列表，不带分页
export function getProductAttrAll(data) {
  return $http({
    url: 'sys/cdn/suit/productAttr/all',
    method: 'get'
  })
}

// 保存 and 修改产品属性
export function doCreateUpdateProductAttr(data) {
  return $http({
    url: 'sys/cdn/suit/productAttr/save',
    method: 'post',
    data
  })
}

// 删除产品属性
export function doDeleteProductAttr(params) {
  return $http({
    url: 'sys/cdn/suit/productAttr/delete',
    method: 'get',
    params
  })
}

/* =====================================
 *       已售产品
 *  =====================================
 */
// 获取已售产品列表，带分页
export function getSuitList(data) {
  return $http({
    url: 'sys/cdn/suit/suit/list',
    method: 'post',
    data
  })
}

//  by UserId 获取所有套餐列表
export function getSuitListByUserId(data) {
  return $http({
    url: 'sys/cdn/suit/suit/listbyuser',
    method: 'post',
    data
  })
}

/**
 * @description: 获取套餐详情  SerialNumber
 */
export function getSuitDetail(params) {
  return $http({
    url: 'sys/cdn/suit/suit/detail',
    method: 'get',
    params
  })
}

/**
 * @description: 删除套餐|注销套餐  SerialNumber
 */
export function doCancellationPlan(params) {
  return $http({
    url: 'sys/cdn/suit/suit/cancellation',
    method: 'get',
    params
  })
}

/**
 * @description: 禁用、启用套餐，切换套餐状态
 */
export function doForbidPlan(data) {
  return $http({
    url: 'sys/cdn/suit/suit/status/modify',
    method: 'post',
    data
  })
}

/**
 * @description: 后付费(95带宽、日峰值带宽)套餐清算  SerialNumber
 */
export function doLiquidationPlan(params) {
  return $http({
    url: 'sys/cdn/suit/suit/liquidation',
    method: 'get',
    params
  })
}

/**
 * @description: 修改已售套餐配置
 */
export function doUpdateSoldPlanAttr(data) {
  return $http({
    url: 'sys/cdn/suit/suit/attr/update',
    method: 'post',
    data
  })
}
