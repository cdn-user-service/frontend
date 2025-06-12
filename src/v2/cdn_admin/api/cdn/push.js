import { $http, $qs } from '../../request'

// 根据输入数据推送数据，waf、节点、站点都可以用、重签证书
export function pushByInputInfo(data) {
    return $http({
        url: 'sys/cdnsys/auth/pushByInputInfo',
        method: 'post',
        data
    })
}

// 生成站点配置文件到节点, 单个站点刷新预热 siteId
export function pushSiteConfToNode(params) {
    return $http({
        url: 'sys/cdnsys/auth/pushSiteConfToNode',
        method: 'get',
        params
    })
}

// 推送所有数据到节点，即一键推送所有数据
export function pushDataToNode() {
    return $http({
        url: 'sys/cdnsys/auth/pushDataToNode',
        method: 'get'
    })
}

// 节点发起配置反馈查看，查询推送状态详情, types = 1(站点),2(详细反馈)， index = 上面接口返回的 data
export function queryPushDetail(params) {
    return $http({
        url: 'sys/cdnsys/auth/push/feedbacks/detail',
        method: 'get',
        params
    })
}

// 查询待完任务数量和任务状态
export function queryPushTaskStatus() {
    return $http({
        url: 'sys/cdnsys/auth/pushTaskStatus',
        method: 'get'
    })
}

// 执行所有待完成任务
export function runPushTask() {
    return $http({
        url: 'sys/cdnsys/auth/runTask',
        method: 'get'
    })
}
