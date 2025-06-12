import { $http, $qs } from '../../request'

/**
 * @description: 获取日志列表 AppDnsController = dns记录操作日志， AppAccountController = 用户账号相关日志
 * @param {*} data
 * @return {*}
 */
export function getList(data) {
    return $http({
        url: 'app/account/log/list',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 删除日志-批量删除
export function doDelete(params) {
    return $http({
        url: 'app/account/log/delete',
        method: 'get',
        params
    })
}
