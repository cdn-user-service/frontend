import { $http, $qs } from '../../request'

// 分页 Prometheus 统计数据
// 只有两个参数 path = 路径， params = 构造请求参数
export function getPrometheus(data) {
  return $http({
    url: 'sys/cdn/site/getPrometheus',
    method: 'post',
    data
  })
}

// 新的统计接口， es
export function getElastic(data) {
  return $http({
    url: 'sys/cdn/site/query/elk',
    method: 'post',
    // 参数名跟DNS的不一样，这里需要转换一下
    data: {
      method: data.method || 'GET',
      path: data.uri,
      param: data.postData
    }
  })
}

// 构建 AI 模型
export function aiWafModel(data) {
  return $http({
    url: 'sys/cdn/site/ai/waf/modelling',
    method: 'post',
    data
  })
}

// 根据域名查询ID
export function getDomainId(params) {
  return $http({
    url: 'sys/cdn/site/site/info',
    method: 'get',
    params
  })
}
