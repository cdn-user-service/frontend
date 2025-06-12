import { $http, $qs } from '../../request'

// 监测接入TOKEN 与 URL
export function checkTokenUrl() {
    return $http({
        url: 'sys/cdnsys/auth/check/key/show',
        method: 'get'
    })
}

// 分页获取监测状态列表
export function getDispatchStatusList(data) {
    return $http({
        url: 'sys/cdnsys/auth/group/node/stable/infos',
        method: 'post',
        data
    })
}
