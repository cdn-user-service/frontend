import { $http, $qs } from '../request'

// 登录IP白名单-列表
export function loginWhiteIpList(data) {
  return $http({
    url: 'app/account/user/login-white-ip/list',
    method: 'post',
    data
  })
}

// 登录IP白名单-保存
export function loginWhiteIpSave(data) {
  return $http({
    url: 'app/account/user/login-white-ip/save',
    method: 'post',
    data
  })
}

// 登录IP白名单-删除
export function loginWhiteIpDelete(data) {
  return $http({
    url: 'app/account/user/login-white-ip/delete',
    method: 'post',
    data
  })
}

// 登录IP白名单-更新用户绑定信息
export function userModuleUpdate(data) {
  return $http({
    url: 'app/account/user-module/update',
    method: 'post',
    data
  })
}
