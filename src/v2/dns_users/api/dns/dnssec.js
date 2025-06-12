import { $http, $qs } from '../../request'

// 立即启用DNSSEC，获取数据
export function getDomainSec(params) {
  return $http({
    url: 'app/dns/domain/sec',
    method: 'get',
    params
  })
}

// 获取 DNSSEC 列表
export function getSecList(data) {
  return $http({
    url: 'app/dns/dnssec/list',
    method: 'post',
    data
  })
}

// 添加
export function doSaveSec(data) {
  return $http({
    url: 'app/dns/dnssec/save',
    method: 'post',
    data
  })
}

// 删除
export function doDeleteSec(data) {
  return $http({
    url: 'app/dns/dnssec/delete',
    method: 'post',
    data
  })
}

// 同步
export function doSyncSec(params) {
  return $http({
    url: 'app/dns/sync/delete',
    method: 'get',
    params
  })
}
