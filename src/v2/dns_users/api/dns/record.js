import { $http, $qs } from '../../request'

// 获取解析记录列表
export function getList(data) {
  return $http({
    url: 'app/dns/record/list',
    method: 'post',
    data
  })
}

// ddns 接口
export function getDdns(params) {
  return $http({
    url: 'app/capi/ddns/v1',
    method: 'get',
    params
  })
}

/**
 * @description: 添加、修改、删除解析记录
 *  添加：record_id = null， operation_type = 'add'
 *  修改：record_id = record_id， operation_type = 'update'
 *  删除：record_id = record_id， operation_type = 'delete'
 */
export function doCreate(data) {
  return $http({
    url: 'app/dns/record/set',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 获取线路列表
export function getLineList(params) {
  return $http({
    url: 'app/dns/line/list',
    method: 'get',
    params
  })
}

// 批量暂停-开启解析: 1 = 开启 | 3 = 暂停 | 2 = 隐藏
export function switchStatus(data) {
  return $http({
    url: 'app/dns/batch/update/domain/record/status',
    method: 'post',
    data
  })
}

// 批量删除解析记录
export function bulkDelete(data) {
  return $http({
    url: 'app/dns/batch/delete/domain/record',
    method: 'post',
    data
  })
}

/* 自定义线路
------------------------------------------------------------- */
// 获取自定义线路列表
export function getUserDefindLineList(data) {
  return $http({
    url: 'app/dns/GetUserDefindLineList',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 保存自定义线路
export function doCreateUserDefindLine(data) {
  return $http({
    url: 'app/dns/defindLine/set',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 删除自定义线路
export function doDeleteUserDefindLine(data) {
  return $http({
    url: 'app/dns/defindLine/delete',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 获取解析记录操作日志
export function getHandleLogList(params) {
  return $http({
    url: 'app/dns/GetDnsOperationLog',
    method: 'get',
    params
  })
}
