import { $http, $qs } from '../../request'

// 同步更新ANTS IP 数据
export function syncAntsIpData(params) {
    return $http({
        url: 'sys/cdnsys/ip/control/sync/ants/ip/data',
        method: 'get',
        params
    })
}

// 获取黑白名单IP列表
export function getIpControlList(data) {
    return $http({
        url: 'sys/cdnsys/ip/control/list',
        method: 'post',
        data
    })
}

// ip 或者 分组 添加修改
export function doSaveIpOrControl(data) {
    return $http({
        url: 'sys/cdnsys/ip/control/save',
        method: 'post',
        data
    })
}

// ip 批量添加
export function doBatchSaveIp(data) {
    return $http({
        url: 'sys/cdnsys/ip/control/bat/child/save',
        method: 'post',
        data
    })
}

// ip 或者 分组 批量删除
export function doBatchDeleteIpOrControl(data) {
    return $http({
        url: 'sys/cdnsys/ip/control/batch/delete',
        method: 'post',
        data
    })
}
