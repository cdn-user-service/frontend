
import { $http, $qs } from '../../request'

/* 基础Ip库
------------------------------------------------------------- */
// 获取基础IP库列表
export function getIpList(data) {
    return $http({
        url: 'sys/dns/GetIpList',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 批量导入 IP 数据
export function importIpListData(data) {
    return $http({
        url: 'sys/dns/ImportIpListData',
        method: 'post',
        data,
        timeout: 5 * 60 * 1000 // 设置超时时间为 5分钟
    })
}

// 筛选基础IP到 标准IP
export function doImportBaseIpToSuccessIp(data) {
    return $http({
        url: 'sys/dns/Ip2AclIp',
        method: 'post',
        data
    })
}

// 批量删除已导入 IP 数据
export function doDeleteIpList(data) {
    return $http({
        url: 'sys/dns/DeleteIpListByIds',
        method: 'post',
        data: $qs.stringify(data)
    })
}

/* 标准 Ip 库
------------------------------------------------------------- */
// 获取已识别IP列表数据
export function getAclIpListData(data) {
    return $http({
        url: 'sys/dns/GetAclIpListData',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 批量识别IP段，根据传入的 CODE 识别 ACLips
export function doCheckAclIpList(data) {
    return $http({
        url: 'sys/dns/Approved/AclIp',
        method: 'post',
        data
    })
}

// 手动输入单个IP段数据
export function doCreateAclIp(data) {
    return $http({
        url: 'sys/dns/CreateAclIp',
        method: 'post',
        data
    })
}

// 全部推送 已识别IP段
export function doAllPushAclIp() {
    return $http({
        url: 'sys/dns/PushAllReviewedAclIp2Kafka',
        method: 'get'
    })
}

// 批量 推送 已识别IP段
export function doUpdatePushAclIp(data) {
    return $http({
        url: 'sys/dns/UpdatePushAclIp',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 批量 取消 已识别IP段
export function doDeleteAclIp(data) {
    return $http({
        url: 'sys/dns/DeleteAclIpListByIds',
        method: 'post',
        data
    })
}

// 修改已识别IP段信息
export function doUpdateAclIpInfo(data) {
    return $http({
        url: 'sys/dns/ModifyAclIpData',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 自动识别IP段
export function doIpAreaRepair() {
  return $http({
    url: 'sys/dns/request/ip/area/repair',
    method: 'get'
  })
}
