import { $http, $qs } from '../../request'

/**
 * @description: 获取日志列表 AppDnsController = dns记录操作日志， AppAccountController = 用户账号相关日志
 * @param {*} data
 * @return {*}
 */
export function getLogList(data) {
    return $http({
        url: 'app/log/list',
        method: 'post',
        data
    })
}

// 删除日志-批量删除
export function doDeleteLog(params) {
    return $http({
        url: 'app/log/log/delete',
        method: 'get',
        params
    })
}
