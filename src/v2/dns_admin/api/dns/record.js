import { $http, $qs } from '../../request'

// 获取解析记录列表
export function getList(data) {
  return $http({
    url: 'sys/dns/GetDomainValue',
    method: 'post',
    data
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
    url: 'sys/dns/SetDomainInfo',
    method: 'post',
    data
  })
}

// 获取线路列表
export function getLineList(data) {
  return $http({
    url: 'sys/dns/linelist',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 批量暂停-开启解析: 1 = 开启 | 3 = 暂停 | 2 = 隐藏
export function switchStatus(data) {
  return $http({
    url: 'sys/dns/batch/update/domain/record/status',
    method: 'post',
    data
  })
}

// 批量删除解析记录
export function bulkDelete(data) {
  return $http({
    url: 'sys/dns/batch/delete/domain/record',
    method: 'post',
    data
  })
}

/* 自定义线路
------------------------------------------------------------- */
// 获取自定义线路列表
export function getUserDefindLineList(data) {
  return $http({
    url: 'sys/dns/GetUserDefindLineList',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 保存自定义线路
export function doCreateUserDefindLine(data) {
  return $http({
    url: 'sys/dns/SaveUserDefindLine',
    method: 'post',
    data
  })
}

// 删除自定义线路
export function doDeleteUserDefindLine(data) {
  return $http({
    url: 'sys/dns/DeleteUserDefindLineByIds',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 获取操作日志
export function getHandleLogList(params) {
  return $http({
    url: 'sys/dns/GetDnsOperationLog',
    method: 'get',
    params
  })
}
