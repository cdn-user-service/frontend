import { $http, $qs } from '../../request'

// 获取递归与转发配置
export function getDnsRecursive(data) {
    return $http({
        url: 'sys/dns/recursive/GetDnsRecursive/detail',
        method: 'post',
        data
    })
}

// 获取递归与转发配置
export function saveDnsRecursive(data) {
    return $http({
        url: 'sys/dns/recursive/saveDnsRecursive/detail',
        method: 'post',
        data
    })
}

// 删除配置
export function deleteDnsRecursive(data) {
    return $http({
        url: 'sys/dns/recursive/deleteDnsRecursive/detail',
        method: 'post',
        data
    })
}
