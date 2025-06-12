import { $http, $qs } from '../../request'

// api 密钥列表
export function getList(data) {
    return $http({
        url: 'app/capi/account/list',
        method: 'post',
        data
    })
}

// 创建
export function doCreate(params) {
    return $http({
        url: 'app/capi/account/create',
        method: 'get',
        params
    })
}

// 删除-可批量
export function doDelete(data) {
    return $http({
        url: 'app/capi/account/delete',
        method: 'post',
        data
    })
}

// 状态修改
export function doUpdateStatus(params) {
    return $http({
        url: 'app/capi/account/status',
        method: 'get',
        params
    })
}
