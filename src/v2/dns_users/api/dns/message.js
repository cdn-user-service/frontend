import { $http, $qs } from '../../request'

// 获取公告数据
export function getNoticeList(data) {
    return $http({
        url: 'app/common/notice/list',
        method: 'post',
        data
    })
}

// 获取消息通知列表
export function getMsgList(data) {
    return $http({
        url: 'app/account/message/list',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 删除消息
export function doDelete(data) {
    return $http({
        url: 'app/account/message/delete',
        method: 'post',
        data: $qs.stringify(data)
    })
}

// 查看详情 - 同时标记为已读
export function getItem(params) {
    return $http({
        url: 'app/account/message/info',
        method: 'get',
        params
    })
}
