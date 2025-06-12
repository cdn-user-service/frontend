
import { $http, $qs } from '../../request'
// 获取管理列表
export function getAdminList(data) {
  return $http({
    url: 'sys/user/list',
    method: 'post',
    data
  })
}

// 获取当前管理员信息
export function getAdminInfo() {
  return $http({
    url: 'sys/user/info',
    method: 'get'
  })
}

// by ID 获取管理员信息
export function getAdminInfoById(id) {
  return $http({
    url: `sys/user/info/${id}`,
    method: 'get'
  })
}

// 添加管理
export function doCreateAdmin(data) {
  return $http({
    url: 'sys/user/save',
    method: 'post',
    data
  })
}

// 修改管理
export function doUpdateAdmin(data) {
  return $http({
    url: 'sys/user/update',
    method: 'post',
    data
  })
}

// 删除管理
export function doDeleteAdmin(data) {
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
