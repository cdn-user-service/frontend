import { $http, $qs } from '../../request'

// 获取消息列表
export function getMessageList(data) {
  return $http({
    url: 'sys/message/GetMessageList',
    method: 'post',
    data
  })
}

// by ID 获取消息详情
export function getMessageInfoById(id) {
  return $http({
    url: `sys/message/info/${id}`,
    method: 'get'
  })
}

// 创建、修改 消息
export function doCreateUpdateMessage(data) {
  return $http({
    url: 'sys/message/SaveMessage',
    method: 'post',
    data
  })
}

// 删除消息
export function doDeleteMessage(data) {
  return $http({
    url: 'sys/message/delete',
    method: 'post',
    data
  })
}
