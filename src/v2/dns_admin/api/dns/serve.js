import {
  $http,
  $qs
} from '../../request'

/* 分组
 * ------------------------------------------------------------- */
// 获取分组列表 - 带分页
export function getServerGroupList(data) {
  return $http({
    url: 'sys/finance/product/GetProductSeverGroupList',
    method: 'post',
    data
  })
}

// 根据业务分组ID获取 dns_host 列表
export function getHostListByGroupId(params) {
  return $http({
    url: 'sys/finance/product/GetProductServerNav',
    method: 'get',
    params
  })
}

// 获取分组列表 - 不带分页
export function getSeverGroupNav() {
  return $http({
    url: 'sys/finance/product/GetProductSeverGroupListNav',
    method: 'get'
  })
}

// 保存-修改-删除分组
export function doUpdateServerGroup(data) {
  return $http({
    url: 'sys/finance/product/SaveProductSeverGroup',
    method: 'post',
    data
  })
}

/* 节点列表
 * ------------------------------------------------------------- */
// 获取节点列表 - 不带分页
export function getSeverNav() {
  return $http({
    url: 'sys/finance/product/GetProductServerNav',
    method: 'get'
  })
}

// 获取server列表 - 带分页
export function getServerList(params) {
  return $http({
    url: 'sys/finance/product/GetProductServerList',
    method: 'get',
    params
  })
}

// 添加-修改 sever
export function doUpdateServer(data) {
  return $http({
    url: 'sys/finance/product/SaveProductServerInfo',
    method: 'post',
    data
  })
}

// 根据 ID 获取sever节点详情数据
export function getServerInfoById(params) {
  return $http({
    url: 'sys/finance/product/GetProductServerInfo',
    method: 'get',
    params
  })
}

// 删除 sever
export function doDeleteServer(data) {
  return $http({
    url: 'sys/finance/product/DeleteProductServer',
    method: 'post',
    data
  })
}

// 批量添加备IP
export function doBatchCreateBackupNode(data) {
  return $http({
    url: 'sys/finance/product/client/backip/save',
    method: 'post',
    data
  })
}

// 修改节点ssh信息
export function doUpdateNodeSsh(data) {
  return $http({
    url: 'sys/finance/product/save/ssh/info',
    method: 'post',
    data
  })
}

/** =======================================
 *              全局配置
 *  =======================================
 */
// 获取全局配置数据
export function getGlobalConfig() {
    return $http({
        url: 'sys/dns/server/global/config/list',
        method: 'get'
    })
}

// 全部保存全局配置数据
export function saveAllGlobalConfig(data) {
    return $http({
        url: 'sys/dns/global/config/update',
        method: 'post',
        data
    })
}

// 根据ID 保存全局配置数据
export function saveGlobalConfig(data) {
    return $http({
        url: 'sys/dns/server/global/config/save',
        method: 'post',
        data
    })
}

// 删除全局配置数据
export function deleteGlobalConfig(params) {
    return $http({
        url: 'sys/dns/server/global/config/delete',
        method: 'get',
        params
    })
}
