import { $http, $qs } from '../../request'

// 获取用户列表
export function getUserList(params) {
  return $http({
    url: 'sys/app_user/list',
    method: 'get',
    params
  })
}

// 检索用户列表
export function getUserListNav(params) {
  return $http({
    url: 'sys/app_user/list/nav',
    method: 'get',
    params
  })
}

// 添加 - 修改 用户
export function doCreateUser(data) {
  return $http({
    url: 'sys/app_user/save',
    method: 'post',
    data
  })
}

// 冻结用户，该接口可用于修改用户单个属性
export function doUpdateUser(data) {
  return $http({
    url: 'sys/app_user/update',
    method: 'post',
    data
  })
}

// 删除用户
export function doDeleteUser(data) {
  return $http({
    url: 'sys/app_user/delete',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 前往客户端
export function goUserClientConsole(params) {
  return $http({
    url: 'sys/app_user/back/login',
    method: 'get',
    params
  })
}

/* 管理
-------------------------------------------------------------- */
// 获取当前管理员信息
export function getAdminInfo() {
  return $http({
    url: 'sys/user/info',
    method: 'get'
  })
}

// 获取管理列表
export function getManagerList(params) {
  return $http({
    url: 'sys/user/list',
    method: 'get',
    params
  })
}

// 获取角色列表
export function getRoleList() {
  return $http({
    url: 'sys/role/select',
    method: 'get'
  })
}

// 添加管理
export function doCreateManager(data) {
  return $http({
    url: 'sys/user/save',
    method: 'post',
    data
  })
}

// 修改管理
export function doUpdateManager(data) {
  return $http({
    url: 'sys/user/update',
    method: 'post',
    data
  })
}

// 删除管理
export function doDeleteManager(data) {
  return $http({
    url: 'sys/user/delete',
    method: 'post',
    data
  })
}

// 修改管理密码
export function resetPassword(data) {
  return $http({
    url: 'sys/user/password',
    method: 'post',
    data
  })
}
