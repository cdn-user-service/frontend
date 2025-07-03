import { $http, $qs } from '../../request'

// 邮箱-手机号-账号登录
export function login(data) {
  console.log('login', data)
  return $http({
    url: 'app/account/login',
    method: 'post',
    data: data
  })
}

// 获取微信二维码
export function wxcode(params) {
  return $http({
    url: 'app/account/login/wechat/qrcode_v2',
    method: 'get',
    params
  })
}

// 监听微信扫码
export function listenWxcode(params) {
  return $http({
    url: 'app/account/login/wechat/callback_v2',
    method: 'get',
    params
  })
}

// 微信注册选择绑定已有账号
export function wxbind(data) {
  return $http({
    url: 'app/account/login/wechat/bind',
    method: 'post',
    data
  })
}

// 微信注册选择注册新账号，提交
export function wxnew(params) {
  return $http({
    url: 'app/account/login/wechat/regist',
    method: 'get',
    params
  })
}

// 微信注册选择注册新账号，设置密码
export function setPassword(params) {
  return $http({
    url: 'app/account/user/password/set',
    method: 'get',
    params
  })
}

// 获取 手机-邮箱 验证码
export function getCode(type, params) {
  return $http({
    url:
      type === 'mail'
        ? 'app/account/sendmail/code'
        : 'app/account/sendsms/code',
    method: 'get',
    params
  })
}

// 注册提交
export function register(data) {
  return $http({
    url: 'app/account/regist',
    method: 'post',
    data
  })
}

// 注册，检查用户是否已存在, user
export function checkRegister(params) {
  return $http({
    url: 'app/account/user/check',
    method: 'get',
    params
  })
}

// 手机-邮箱找回登录密码
export function resetPassword(data) {
  return $http({
    url: 'app/account/forget/password',
    method: 'post',
    data
  })
}

// 谷歌-绑定账号
export function googleBind(data) {
  return $http({
    url: 'app/account/google-auth/bind',
    method: 'post',
    data
  })
}

// 谷歌-登录
export function googleLogin(data) {
  return $http({
    url: 'app/account/google-auth/login',
    method: 'post',
    data
  })
}

// 谷歌-获取验证码
export function googleQrcode(params) {
  return $http({
    url: 'app/account/google-auth/qrcode/view',
    method: 'get',
    params
  })
}

// 谷歌-检查状态
export function googleStatus(params) {
  return $http({
    url: 'app/account/google-auth/status',
    method: 'get',
    params
  })
}

// 检查是否需要google认证
export function googleCheck(params) {
  return $http({
    url: 'app/account/user/check',
    method: 'get',
    params
  })
}
