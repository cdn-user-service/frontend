import { $http, $qs } from '../../request'

// 检查实名状态（data为空）、提交姓名身份证号（data不为空），
export function authStatus(data) {
  return $http({
    url: 'app/product/user/auth',
    method: 'post',
    data: $qs.stringify(data)
  })
}

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
    data: $qs.stringify(data)
  })
}

// 设置支付密码
export function payPassword(data) {
  return $http({
    url: 'app/account/paypwd/set',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 重置支付密码
export function payPasswordReset(data) {
  return $http({
    url: 'app/account/paypwd/reset',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 重置登录密码
export function resetPassword(data) {
  return $http({
    url: 'app/account/changepwd',
    method: 'post',
    data: $qs.stringify(data)
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

// 获取相关联CDN套餐列表  access_token
export function getCdnPlan(params) {
  return $http({
    url: 'app/product/by_access/suit/listbyuser',
    method: 'get',
    params
  })
}
