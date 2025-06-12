import { $http, $qs } from '../../request'

// 获取图表数据列表
export function getQpsChart(data) {
  return $http({
    url: 'sys/dns/RequestPrometheusRecord',
    method: 'post',
    data
  })
}

// 获取host列表数据
export function getHostList() {
  return $http({
    url: 'sys/dns/GetDnsServerHostList',
    method: 'get'
  })
}

// 新的统计接口， qps
export function getElastic(data) {
  return $http({
    url: 'sys/dns/RequestElasticsearchsRecord',
    method: 'post',
    data: {
      ...data,
      method: data.method || 'GET',
      uri: data.uri,
      postData: data.postData
    }
  })
}
