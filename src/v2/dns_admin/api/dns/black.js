import { $http, $qs } from '../../request'

// 黑名单域名列表
export function getBlackList(data) {
  return $http({
    url: 'sys/dns/black/list',
    method: 'post',
    data
  })
}

// 保存黑名单域名列表，新增and膝盖
export function doSaveBlackList(data) {
  return $http({
    url: 'sys/dns/black/save',
    method: 'post',
    data
  })
}

// 批量删除黑名单域名列表
export function doDeleteBlackList(data) {
  return $http({
    url: 'sys/dns/black/delete',
    method: 'post',
    data
  })
}
