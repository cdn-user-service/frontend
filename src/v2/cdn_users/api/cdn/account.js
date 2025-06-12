import { $http, $qs } from '../../request'

// 获取用户信息
export function getUserInfo() {
  return $http({
    url: 'app/account/userinfo',
    method: 'get'
    // params
  })
}

// 获取绑定微信二维码
export function bindWechatCode(params) {
  return $http({
    url: 'app/account/bind/wechat/qrcode_v2',
    method: 'get',
    params
  })
}

// 绑定 手机号 - 邮箱 提交
export function bindMailMobile(data) {
  return $http({
    url: 'app/account/bind',
    method: 'post',
    data
  })
}

// 重置登录密码
export function resetPassword(data) {
  return $http({
    url: 'app/account/changepwd',
    method: 'post',
    data
  })
}

// 设置支付密码 pwd
export function payPassword(params) {
  return $http({
    url: 'app/account/user/propertyPayPassword/set',
    method: 'get',
    params
  })
}

// 重置支付密码
export function payPasswordReset(data) {
  return $http({
    url: 'app/account/user/propertyPayPassword/reset',
    method: 'post',
    data
  })
}

/* =====================================
 *       实名认证相关
 *  =====================================
 */
// 用户实名认证 cert_name = 姓名 ，cert_no = 身份证号

export function authStatus(data) {
  return $http({
    url: 'app/product/user/auth',
    method: 'post',
    data
  })
}

/* =====================================
 *       与其他平台账号关联相关
 *  =====================================
 */
// 请求其他平台的接口
export function requestOther(data) {
  return $http({
    url: 'app/account/request',
    method: 'post',
    data: {
      method: data.method,
      param: data.param,
      url: data.url
    }
  })
}

// CDN_ACCESS_TOKEN
export function cdnAccessToken(data) {
  return $http({
    url: 'app/account/update/cdn_access_token',
    method: 'post',
    data
  })
}

// DNS_ACCESS_TOKEN
export function dnsAccessToken(data) {
  return $http({
    url: 'app/account/update/dns_access_token',
    method: 'post',
    data
  })
}

// ACCESS_TOKEN 登录  access_token
export function loginByaccess(params) {
  return $http({
    url: 'app/account/access/login',
    method: 'get',
    params
  })
}
