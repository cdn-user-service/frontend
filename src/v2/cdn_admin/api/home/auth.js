import { $http, $qs } from '../../request'

// 获取授权信息
export function getAuthInfo() {
  return $http({
    url: 'sys/cdnsys/auth/info',
    method: 'get'
  })
}

// 获取节点列表
export function getAuthNodeList() {
  return $http({
    url: 'sys/cdnsys/auth/node/list',
    method: 'get'
  })
}

// 节点注册[节点向主控发起注册]
export function doAddAuthNode() {
  return $http({
    url: 'sys/cdnsys/auth/node/add',
    method: 'get'
  })
}

// 节点授权【主控向ants发起注册】
export function doEnableAuthNode(params) {
  return $http({
    url: 'sys/cdnsys/auth/node/enable',
    method: 'get',
    params
  })
}

// 节点删除
export function doDeleteAuthNode(params) {
  return $http({
    url: 'sys/cdnsys/auth/node/delete',
    method: 'get',
    params
  })
}

// 节点详情
export function getAuthNodeInfo(params) {
  return $http({
    url: 'sys/cdnsys/auth/node/info',
    method: 'get',
    params
  })
}

// 主控迁移
export function transferMaster(data) {
  return $http({
    url: 'sys/cdnsys/auth/migrate/master',
    method: 'post',
    data
  })
}
