import { $http, $qs } from '../../request'

// 获取公共参数说明，这个接口不需要TOKEN
export function getCommonEnums() {
  return $http({
    url: 'sys/common/enums',
    method: 'get'
  })
}

// 获取网站配置信息数据，这个接口不需要TOKEN
export function getWebConfig() {
  return $http({
    url: 'sys/common/index',
    method: 'get'
  })
}

// 首页图表数据源
export function getChartData(params) {
  return $http({
    url: 'sys/cdnsys/auth/GetIndexChartData',
    method: 'get',
    params
  })
}

// 更新变量，如果检测到本地的 protocol、hostname、port 跟线上的不一致，则要调用这个接口更新
export function doUpdateStaticVariable(data) {
  return $http({
    url: 'sys/cdnsys/auth/update/static/variable',
    method: 'post',
    data
  })
}

// 获取所有产品参数 Obj
export function getProductAttrObj() {
  return $http({
    url: 'app/product/product/attr/object',
    method: 'get'
  })
}

// redis调试接口
export function getRedisData(data) {
  return $http({
    url: 'sys/cdnsys/admin/tool/redis/data',
    method: 'post',
    data
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

// 请求其他平台的接口
export function requestOther(data) {
  return $http({
    url: 'sys/common/request',
    // url: 'sys_common/request',
    method: 'post',
    data: {
      method: data.method,
      param: data.param,
      params: data.params,
      url: data.url
    }
  })
}
