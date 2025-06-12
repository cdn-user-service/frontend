import { $http, $qs } from '../../request'

// 管理员登录
export function login(data) {
  return $http({
    url: 'sys/login',
    method: 'post',
    data
  })
}

// 谷歌-绑定账号
export function googleBind(data) {
  return $http({
    url: 'sys/user/google-auth/bind',
    method: 'post',
    data
  })
}

// 谷歌-登录
export function googleLogin(data) {
  return $http({
    url: 'sys/google-auth/login',
    method: 'post',
    data
  })
}

// 谷歌-获取验证码
export function googleQrcode(params) {
  return $http({
    url: 'sys/user/google-auth/qrcode/view',
    method: 'get',
    params
  })
}

// 谷歌-检查状态
export function googleStatus(params) {
  return $http({
    url: 'sys/user/google-auth/status',
    method: 'get',
    params
  })
}

// 检查是否需要google认证
export function googleCheck(params) {
  return $http({
    url: 'sys-user/check',
    method: 'get',
    params
  })
}
