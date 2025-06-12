import { $http, $qs } from '../../request'

// 分页获取 DNS API 列表
export function getDnsApiList(data) {
  return $http({
    url: 'app/dnsapi/list',
    method: 'post',
    data
  })
}

// 获取 DNS API 列表, 不带分页
export function getDnsApiAll() {
  return $http({
    url: 'app/dnsapi/all',
    method: 'get'
  })
}

// 添加 + 修改 DNS API
export function doCreateUpdateDnsApi(data) {
  return $http({
    url: 'app/dnsapi/save',
    method: 'post',
    data
  })
}

// 删除 DNS API
export function doDeleteDnsApi(data) {
  return $http({
    url: 'app/dnsapi/delete',
    method: 'post',
    data
  })
}

/* =====================================
 *       解析记录相关
 *  =====================================
 */

// 根据 DNSAPI ID 获取解析记录列表
export function getRecordList(params) {
  return $http({
    url: 'app/dnsapi/record/list',
    method: 'get',
    params
  })
}

// 根据 DNSAPI ID domain 获取解析记录列表
export function getRecordListV2(params) {
  return $http({
    url: 'app/dnsapi/record/list/v2',
    method: 'get',
    params
  })
}

// 根据 DNSAPI ID 获取解析线路
export function getlineList(params) {
  return $http({
    url: 'app/dnsapi/line/list',
    method: 'get',
    params
  })
}

export function getlineListV1(params) {
  return $http({
    url: 'app/dnsapi/line/list/v1',
    method: 'get',
    params
  })
}

// 根据 DNSAPI ID 获取解析线路
export function getlineListV2(params) {
  return $http({
    url: 'app/dnsapi/line/list/v2',
    method: 'get',
    params
  })
}

// 添加解析记录
export function doCreateRecord(data) {
  return $http({
    url: 'app/dnsapi/record/add',
    method: 'post',
    data
  })
}

// 修改解析记录
export function doUpdateRecord(data) {
  return $http({
    url: 'app/dnsapi/record/modify',
    method: 'post',
    data
  })
}

// 删除解析记录
export function doDeleteRecord(data) {
  return $http({
    url: 'app/dnsapi/record/remove',
    method: 'post',
    data
  })
}
