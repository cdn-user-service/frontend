import { $http, $qs } from '../../request'

// 分页获取四层转发列表
export function getStreamList(data) {
  return $http({
    url: 'app/stream/list',
    method: 'post',
    data
  })
}

// 创建、修改 四层转发
export function doCreateUpdateStream(data) {
  return $http({
    url: 'app/stream/sava',
    method: 'post',
    data
  })
}

// 批量删除四层转发 ids
export function doDeleteBatchStream(data) {
  return $http({
    url: 'app/stream/batch/delete',
    method: 'post',
    data
  })
}

// 获取用户所有端口
export function getAllPort() {
  return $http({
    url: 'app/stream/all/port',
    method: 'get'
  })
}

// 获取套餐信息
export function getStreamDetail(params) {
  return $http({
    url: 'app/stream/detail',
    method: 'get',
    params
  })
}
