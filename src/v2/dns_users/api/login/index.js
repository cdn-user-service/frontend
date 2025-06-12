import { $http, $qs } from '../../request'

// 邮箱-手机号登录
export function login(data) {
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
        data: $qs.stringify(data)
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
        url: type === 'mail' 
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

// 注册，检查用户是否已存在, user, 这个接口没有
export function checkRegister(params) {
    return $http({
        url: 'app/account/user/check',
        method: 'get',
        params
    })
}

// 手机-邮箱重置登录密码
export function resetPassword(data) {
    return $http({
        url: 'app/account/forget/password',
        method: 'post',
        data: $qs.stringify(data)
    })
}
