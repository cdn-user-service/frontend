import { $http, $qs } from '../../request'

// 获取 用户及仪表盘数据
export function getDashboardUser() {
    return $http({
        url: 'app/account/user/index',
        method: 'get'
        // params
    })
}
