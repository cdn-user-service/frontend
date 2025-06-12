import { $http, $qs } from '../../request'

// 获取用户列表
export function getUserList(data) {
    return $http({
        url: 'sys/tb/user/list',
        method: 'post',
        data
    })
}

// 获取用户详细信息
export function getUserDetail(params) {
    return $http({
        url: 'sys/tb/user/detail',
        method: 'get',
        params
    })
}

// 创建 用户，密码为空时 默认为 123456
export function doCreateUser(data) {
    return $http({
        url: 'sys/tb/user/create',
        method: 'post',
        data
    })
}

// 修改 用户
export function doUpdateUser(data) {
    return $http({
        url: 'sys/tb/user/modify',
        method: 'post',
        data
    })
}

// 删除用户
export function doDeleteUser(data) {
    return $http({
        url: 'sys/tb/user/deleta',
        method: 'post',
        data
    })
}

// 前往前台用户控制台
export function goUserClientConsole(params) {
    return $http({
        url: 'sys/tb/user/back/login',
        method: 'get',
        params
    })
}

// 检索用户列表
// export function getUserListNav(params) {
//     return $http({
//         url: 'sys/app_user/list/nav',
//         method: 'get',
//         params
//     })
// }

// 冻结用户，该接口可用于修改用户单个属性
// export function doUpdateUser(params) {
//     return $http({
//         url: 'sys/app_user/update',
//         method: 'get',
//         params
//     })
// }
