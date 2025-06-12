import { $http, $qs } from '../../request'

// 微信支付二维码
export function wechatPay(data) {
    return $http({
        url: 'app/pay/wechatPay',
        method: 'post',
        data
    })
}

// 支付宝支付
export function alipay(data) {
    return $http({
        url: 'app/pay/alipay',
        method: 'post',
        data
    })
}

// 余额支付
export function balancePay(data) {
    return $http({
        url: 'app/pay/balancePay',
        method: 'post',
        data
    })
}

// 查询支付结果
export function queryPayResult(params) {
    return $http({
        url: 'app/pay/queryPayResout',
        method: 'get',
        params
    })
}

// 创建stripe支付链接  SerialNumber
export function stripePay(params) {
  return $http({
    url: 'app/product/stripe/payment/link/create',
    method: 'get',
    params
  })
}

// 创建TokenPayz支付  SerialNumber
export function tokenPay(params) {
  return $http({
    url: 'app/product/tokenpay/create',
    method: 'get',
    params
  })
}

// 彩虹易支付 serialNumber，payMethod
export function cccyunPay(params) {
  return $http({
    url: 'app/product/cccyun/create',
    method: 'get',
    params
  })
}
// 创建通联支付链接  SerialNumber， payMethod
export function allinpayPay(params) {
  return $http({
    url: 'app/product/allinpay/pay/create',
    method: 'get',
    params
  })
}
