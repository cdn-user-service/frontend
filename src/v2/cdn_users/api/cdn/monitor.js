import { $http, $qs } from '../../request'

// 分页 Prometheus 统计数据
// 只有两个参数 path = 路径， params = 构造请求参数
export function getPrometheus(data) {
    return $http({
        url: 'app/site/getPrometheus',
        method: 'post',
        data
    })
}

// 新的统计接口， es 
export function getElastic(data) {
    return $http({
      url: 'app/site/query/elk',
      method: 'post',
      // 参数名跟DNS的不一样，这里需要转换一下
      data: {
        path: data.uri,
        param: data.postData
      }
    })
}
