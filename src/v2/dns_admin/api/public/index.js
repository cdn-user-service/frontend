
import { $http, $qs } from '../../request'

// 获取站点配置信息，不需要验证 TOKEN
export function getWebConfig() {
    return $http({
        url: 'sys_common/index',
        method: 'get'
    })
}

// dashboard 获取总览信息
export function getChartData(params) {
    return $http({
        url: 'sys/dns/GetIndexChartData',
        method: 'get',
        params
    })
}

// dashboard 获取当前系统版本信息
export function getVersionData(params) {
    return $http({
        url: 'sys/dns/GetVersionData',
        method: 'get',
        params
    })
}

// 点击手动更新 数据库、web前后台、controller
export function doUpdateVersion(params) {
    return $http({
        url: 'sys/dns/version/update',
        method: 'get',
        params
    })
}

// 获取当前更新队列，Updating = 1 表示有正在更新的任务
export function getUpdateVersionStatus() {
    return $http({
        url: 'sys/dns/GetUpdateStatus',
        method: 'get'
    })
}

// 获取 DNS 更新日志内容
export function getUpdateLog(params) {
    return $http({
        url: 'app/common/web/update/log',
        method: 'get',
        params
    })
}

// 根据ip获取区域信息，不需要验证 TOKEN
export function getIpArea(params) {
    return $http({
        url: 'app/common/query/ip/area',
        method: 'get',
        params
    })
}

// 根据code编码获取区域信息，不需要验证 TOKEN
export function getCodeArea(params) {
  return $http({
    url: 'app/common/query/line/code/area',
    method: 'get',
    params
  })
}

// 请求其他平台的接口
export function requestOther(data) {
  return $http({
    url: 'sys_common/request',
    method: 'post',
    data: {
      method: data.method,
      param: data.param,
      url: data.url
    }
  })
}
