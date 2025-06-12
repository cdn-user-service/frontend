import { $http, $qs } from '../../request'

// 邮箱-手机号登录
export function login(data) {
    return $http({
        url: 'sys_login_login',
        method: 'post',
        data
    })
}
