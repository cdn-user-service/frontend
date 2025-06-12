import { $http, $qs } from '../../request'

// 新的接口，节点分组
// 获取节点分组列表
export function getNodeGroup(data) {
  return $http({
    url: 'sys/cdnsys/auth/client/area/list',
    method: 'post',
    data
  })
}

// 新增、修改节点分组
export function doCreateUpdateNodeGroup(data) {
  return $http({
    url: 'sys/cdnsys/auth/client/area/save',
    method: 'post',
    data
  })
}
// 批量删除节点分组
export function doDeleteNodeGroup(data) {
  return $http({
    url: 'sys/cdnsys/auth/client/area/delete',
    method: 'post',
    data
  })
}

// =========================================
// 分页获取节点列表
export function getNodeList(data) {
  return $http({
    url: 'sys/cdnsys/auth/node/page/list',
    method: 'post',
    data
  })
}

// 创建节点
export function doCreateUpdateNode(data) {
  return $http({
    url: 'sys/cdnsys/auth/node/SaveByMainControl',
    method: 'post',
    data
  })
}

// 删除 节点
export function doDeleteNode(params) {
  return $http({
    url: 'sys/cdnsys/auth/node/delete',
    method: 'get',
    params
  })
}

// 批量添加备用IP
export function doBatchCreateBackupNode(data) {
  return $http({
    url: 'sys/cdnsys/auth/node/add/backup/ip',
    method: 'post',
    data
  })
}

// 批量添加备用IP-回源IP
export function doAddIps(data) {
  return $http({
    url: 'sys/cdnsys/auth/node/add/ip',
    method: 'post',
    data
  })
}

// 节点高级配置可修改参数
export function getNodeConfKeys() {
  return $http({
    url: 'sys/cdnsys/auth/node/conf/keys',
    method: 'get'
  })
}

// 节点高级配置保存
export function doSaveNodeConf(data) {
  return $http({
    url: 'sys/cdnsys/auth/node/save/conf/info',
    method: 'post',
    data
  })
}

// 更新节点，与 ants 同步所有节点信息
export function doRefreshNodeSync() {
  return $http({
    url: 'sys/cdnsys/auth/node/sync',
    method: 'get'
  })
}

// 应用节点，节点授权【主控向ants发起注册】 id
export function doEnableNode(params) {
  return $http({
    url: 'sys/cdnsys/auth/node/enable',
    method: 'get',
    params
  })
}

// 修改节点ssh信息
export function doUpdateNodeSsh(data) {
  return $http({
    url: 'sys/cdnsys/auth/node/ssh/save',
    method: 'post',
    data
  })
}

// 节点线路优化开关
export function switchNodeLine(data) {
  return $http({
    url: 'sys/cdnsys/auth/node/attr/save',
    method: 'post',
    data
  })
}

/* =====================================
 *       业务分组
 *  =====================================
 */
// 分页获取分组列表
export function getGroupList(data) {
  return $http({
    url: 'sys/cdnsys/auth/group/list',
    method: 'post',
    data
  })
}

// 创建、修改分组
export function doCreateUpdateGroup(data) {
  return $http({
    url: 'sys/cdnsys/auth/group/save',
    method: 'post',
    data
  })
}

// 删除业务分组
export function doDeleteGroup(data) {
  return $http({
    url: 'sys/cdnsys/auth/group/delete',
    method: 'post',
    data
  })
}

// 向分组添加节点
export function doAddClientIds(data) {
  return $http({
    url: 'sys/cdnsys/auth/group/add_client_ids',
    method: 'post',
    data
  })
}

// 分组修改节点：状态、线路、TTL
export function doUpdateClient(data) {
  return $http({
    url: 'sys/cdnsys/auth/group/modify_client_dns_info',
    method: 'post',
    data
  })
}

// 向分组移除节点
export function doDeleteClientIds(data) {
  return $http({
    url: 'sys/cdnsys/auth/group/delete_client_ids',
    method: 'post',
    data
  })
}

// 获取分组中未使用的节点 groupId, parentId = 0
export function getUnuesdClient(data) {
  return $http({
    url: 'sys/cdnsys/auth/group/get/unuesd/client',
    method: 'post',
    data
  })
}

// by groupId 获取分组详情
export function getGroupDetailById(params) {
  return $http({
    url: 'sys/cdnsys/auth/group/get_detail',
    method: 'get',
    params
  })
}

// 设置分组中备用节点为主用
export function setFirstClient(data) {
  return $http({
    url: 'sys/cdnsys/auth/group/set_first_client',
    method: 'post',
    data
  })
}
