import { $http, $qs } from '../../request'

// 获取站点配置信息
export function getWebConfig() {
    return $http({
        url: 'app/common/web/config',
        method: 'get'
    })
}

// dashboard 获取用户统计信息
export function getChartData() {
    return $http({
        url: 'app/dns/user/chart/data',
        method: 'get'
    })
}

// 获取同意协议内容
export function getAgreement() {
    return $http({
        url: 'app/common/web/agent',
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
    url: 'app/account/request',
    method: 'post',
    data: {
      method: data.method,
      param: data.param,
      url: data.url
    }
  })
}
