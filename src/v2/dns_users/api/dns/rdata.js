import { $http, $qs } from '../../request'

/** =================================
 *     域名授权
 *  =================================
 */
// 接受域名授权
export function getReceiveList(data) {
  return $http({
    url: 'app/share/rdata/receive/list',
    method: 'post',
    data
  })
}

// 添加接收域名授权
export function addReceiveRdata(params) {
  return $http({
    url: 'app/share/rdata/receive/add',
    method: 'get',
    params
  })
}

// 删除接收域名授权
export function deleteReceiveRdata(data) {
  return $http({
    url: 'app/share/rdata/receive/delete',
    method: 'post',
    data
  })
}

// 发起域名授权
export function getOutList(data) {
  return $http({
    url: 'app/share/rdata/out/list',
    method: 'post',
    data
  })
}

// 添加接收域名授权
export function addOutRdata(data) {
  return $http({
    url: 'app/share/rdata/out/save',
    method: 'post',
    data
  })
}

// 删除接收域名授权
export function deleteOutRdata(data) {
  return $http({
    url: 'app/share/rdata/out/delete',
    method: 'post',
    data
  })
}
