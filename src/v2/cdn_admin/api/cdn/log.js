import { $http, $qs } from '../../request'

// 分页获取 管理、用户日志列表
export function getAdminLogList(data) {
    return $http({
        url: 'sys/log/list',
        method: 'post',
        data
    })
}

// 批量删除日志
export function doDeleteLog(params) {
    return $http({
        url: 'sys/log/delete',
        method: 'get',
        params
    })
}
