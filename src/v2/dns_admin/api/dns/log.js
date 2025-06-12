import { $http, $qs } from '../../request'

// 获取管理日志列表
export function getManagerLogList(data) {
  return $http({
    url: 'sys/log/list',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 删除管理日志
export function doDelManagerLog(data) {
  return $http({
    url: 'sys/log/delete',
    method: 'post',
    data
  })
}

// 获取用户日志列表
export function getUserLogList(params) {
  return $http({
    url: 'sys/app_user/log/list',
    method: 'get',
    params
  })
}

// 删除前台用户日志 ids
export function doDelUserLog(data) {
  return $http({
    url: 'sys/app_user/log/delete',
    method: 'post',
    data
  })
}
