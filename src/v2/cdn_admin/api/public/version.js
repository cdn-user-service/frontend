import { $http, $qs } from '../../request'

// 获取当前系统版本
export function getVersionData(params) {
    return $http({
        url: 'sys/version/GetVersionData',
        method: 'get',
        params
    })
}

// 查询后台版本更新任务状态
export function getUpdateStatus(params) {
    return $http({
        url: 'sys/version/GetUpdateStatus',
        method: 'get',
        params
    })
}

/**
 * @description: 更新当前版本
 *  goods = 类型[web_controller = 接口, web_view_manager = 管理端, web_view_user = 用户端, db = 数据库]
 *  hash = hash值
 */
export function doUpdateVersion(params) {
    return $http({
        url: 'sys/version/version/update',
        method: 'get',
        params
    })
}
