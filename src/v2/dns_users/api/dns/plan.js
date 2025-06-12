import { $http, $qs } from '../../request'

// 用户已有套餐列表
export function getList(params) {
  return $http({
    url: 'app/product/GetUserConsumeList',
    method: 'get',
    params
  })
}

// 删除用户已失效套餐
export function doDeleteUserMeal(params) {
  return $http({
    url: 'app/product/DeleteUserConsume',
    method: 'get',
    params
  })
}

// 创建订单
export function createOrder(data) {
  return $http({
    url: 'app/product/user/createorder',
    method: 'post',
    data
  })
}

// 创建续费订单
export function createRenewal(data) {
  return $http({
    url: 'app/product/user/renewal',
    method: 'post',
    data
  })
}

// 创建升级订单
export function createUpgrade(data) {
  return $http({
    url: 'app/product/user/up',
    method: 'post',
    data
  })
}

// 所有套餐列表
export function getProductList(data) {
  return $http({
    url: 'app/common/product/list',
    method: 'post',
    data
  })
}

// 套餐所有属性列表
export function getProductAttrList(params) {
  return $http({
    url: 'app/product/GetProductAttrNav',
    method: 'get',
    params
  })
}

// 根据产品类型列表，获取用户的域名
export function getUserDomainByLevels(params) {
  return $http({
    url: 'app/product/GetUserDomainByLevels',
    method: 'get',
    params
  })
}

// 获取用户免费域名列表
export function GetUserFreeDomainConsume() {
  return $http({
    url: 'app/product/GetUserFreeDomainConsume',
    method: 'get',
    params: null
  })
}

// 获取用户免费域名列表，带分页的
export function GetUserFreeDomainConsumePage(data) {
  return $http({
    url: 'app/product/GetUserFreeDomainConsumePage',
    method: 'post',
    data
  })
}

// 获取我的所有套餐
// export function getMyPlanAll(data) {
//   return $http({
//     url: 'app/common/product/list',
//     method: 'post',
//     data
//   })
// }

/**
 * 增值业务模块接口
 * ----------------------------------------------------------------------------------------
 */
// 获取用户已有增值业务列表
export function getUserExtraList(data) {
  return $http({
    url: 'app/product/user/increment/list',
    method: 'post',
    data
  })
}

// 增值业务创建订单
export function createExtraOrder(data) {
  return $http({
    url: 'app/product/user/create/extra/order',
    method: 'post',
    data
  })
}

// 获取可购买增值业务列表
export function getCommonExtraList(data) {
  return $http({
    url: 'app/product/common/increment/list',
    method: 'post',
    data
  })
}
