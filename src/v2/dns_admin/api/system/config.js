import { $http, $qs } from '../../request'

// 获取参数列表
export function getList(params) {
  return $http({
    url: 'sys/config/list',
    method: 'get',
    params
  })
}

// 根据 ID 获取具体配置数据, 通过ID获取不可靠，修改为通过KEY获取
export function getConfigById(id) {
  return $http({
    url: `sys/config/info/${id}`,
    method: 'get'
  })
}

// 根据 KEY 获取具体配置数据
export function getConfigByKey(key) {
  return $http({
    url: `sys/config/kinfo?key=${key}`,
    method: 'get'
  })
}

// 根据 ID 开关配置状态
export function toggleStatus(id) {
  return $http({
    url: `sys/config/update/status/${id}`,
    method: 'get'
  })
}

// 根据 ID 开关配置状态,指定开还是关 0 = 关 1 = 开
export function toggleConfStatus(params) {
  return $http({
    url: 'sys/config/update/conf/status',
    method: 'get',
    params
  })
}

// 添加 参数
export function doCreate(data) {
  return $http({
    url: 'sys/config/save',
    method: 'post',
    data
  })
}

// 修改参数
export function doUpdate(data) {
  return $http({
    url: 'sys/config/update',
    method: 'post',
    data
  })
}

// 删除参数
export function doDelete(data) {
  return $http({
    url: 'sys/config/delete',
    method: 'post',
    data
  })
}

// 数据备份-导出 SQL
export function doBackupExport(params) {
  return $http({
    url: 'sys/config/export/db',
    method: 'get',
    params
  })
}

// 数据备份-导入 SQL
export function doBackupImport(data) {
  return $http({
    url: 'sys/config/import/db',
    method: 'post',
    data
  })
}

// 获取节点安装参数
export function getNodeConfView() {
  return $http({
    url: 'sys/config/ants/conf/view',
    method: 'get'
  })
}
