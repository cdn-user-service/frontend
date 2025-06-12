import { $http, $qs } from '../../request'

// 分页获取四层转发列表
export function getStreamList(data) {
  return $http({
    url: 'sys/cdnsys/stream/proxy/list',
    method: 'post',
    data
  })
}

// 创建、修改 四层转发
export function doCreateUpdateStream(data) {
  return $http({
    url: 'sys/cdnsys/stream/proxy/sava',
    method: 'post',
    data
  })
}

// 批量删除四层转发 ids
export function doDeleteBatchStream(data) {
  return $http({
    url: 'sys/cdnsys/stream/proxy/batch/delete',
    method: 'post',
    data
  })
}

// 获取套餐信息
export function getStreamDetail(params) {
  return $http({
    url: 'sys/cdnsys/stream/proxy/detail',
    method: 'get',
    params
  })
}
