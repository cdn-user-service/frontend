import { $http, $qs } from '../../request'

// 获取消息列表
export function getMessageList(data) {
    return $http({
        url: 'sys/message/GetMessageList',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 获取消息详情
export function getItem(params) {
    return $http({
        url: `sys/message/info/${params}`,
        method: 'get'
    })
}

// 添加 - 修改 消息
export function doUpdate(data) {
    return $http({
        url: 'sys/message/SaveMessage',
        method: 'post',
        data
    })
}

// 删除消息
export function doDelete(data) {
    return $http({
        url: 'sys/message/delete',
        method: 'post',
        data
    })
}
