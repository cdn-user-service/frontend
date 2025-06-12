import { $http, $qs } from '../../request'

/**
 * @description: 查询用户流量使用情况
 */
 export function getPlanUsedFlow(data) {
    return $http({
        url: 'sys/cdn/suit/user/suit/bytes/detail',
        method: 'post',
        data
    })
}
