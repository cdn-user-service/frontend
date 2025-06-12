import { $http, $qs } from '../../request'

/* =====================================
 *       工单列表
 *  =====================================
 */
// 获取最新的工单消息
export function getNewOrder() {
  return $http({
    url: 'sys/tb/work/order/wol/new/msg',
    method: 'get'
  })
}

// 分页获取工单列表
export function getWorkOrderList(data) {
  return $http({
    url: 'sys/tb/work/order/wol/list',
    method: 'post',
    data
  })
}

// 批量删除工单
export function doBatchDeleteWorkOrder(data) {
  return $http({
    url: 'sys/tb/work/order/wol/bat/delete',
    method: 'post',
    data
  })
}

// 回复工单
export function doReplayWorkOrder(data) {
  return $http({
    url: 'sys/tb/work/order/wol/send/message',
    method: 'post',
    data
  })
}

// 获取工单详情
export function getWorkOrderDetail(params) {
  return $http({
    url: 'sys/tb/work/order/wol/detail',
    method: 'get',
    params
  })
}

/* =====================================
 *       工单分类
 *  =====================================
 */
// 获取工单分类列表
export function getWorkOrderCategoryList(params) {
  return $http({
    url: 'sys/tb/work/order/category/list',
    method: 'get',
    params
  })
}

// 保存工单分类
export function doSaveWorkOrderCategory(data) {
  return $http({
    url: 'sys/tb/work/order/category/save',
    method: 'post',
    data
  })
}

// 获取工单详情
export function doDeleteWorkOrderCategory(params) {
  return $http({
    url: 'sys/tb/work/order/category/delete',
    method: 'get',
    params
  })
}

// 上传图片、文件
export function doOssUpload(data) {
  return $http({
    url: 'sys/oss/upload',
    method: 'post',
    data
  })
}
