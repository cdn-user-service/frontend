import { $http, $qs } from '../../request'

// 获取我的域名列表
export function getQpsChart(data) {
  return $http({
    url: 'app/dns/RequestPrometheusRecord',
    method: 'post',
    data
  })
}

// 新的统计接口， qps
export function getElastic(data) {
  return $http({
    url: 'app/dns/RequestElasticsearchsRecord',
    method: 'post',
    data
  })
}
