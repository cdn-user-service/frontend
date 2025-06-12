import { $http, $qs } from '../../request'

// 获取定时任务列表
export function getList(params) {
    return $http({
        url: 'sys/schedule/list',
        method: 'get',
        params
    })
}

// 添加 - 修改定时任务
export function doUpdate(data, type) {
    return $http({
        url: type === 'update'
        ? 'sys/schedule/update'
        : 'sys/schedule/save',
        method: 'post',
        data
    })
}

// 获取任务名称列表，添加修改时需要
export function getTaskEnum() {
    return $http({
        url: 'sys/schedule/task/enum',
        method: 'get'
    })
}

// 切换定时任务状态
export function doSwitch(data) {
    return $http({
        url: 'sys/schedule/update/status',
        method: 'post',
        data
    })
}

/* 批量执行-暂停-恢复
* 执行  = sys/schedule/run
* 暂停  = sys/schedule/pause
* 恢复  = sys/schedule/resume
*/
export function doBatch(data, type) {
    return $http({
        url: `sys/schedule/${type}`,
        method: 'post',
        data
    })
}

// 删除定时任务
export function doDelete(data) {
    return $http({
        url: 'sys/schedule/delete',
        method: 'post',
        data
    })
}

// 获取定时任务日志列表
export function getLogList(params) {
    return $http({
        url: 'sys/scheduleLog/list',
        method: 'get',
        params
    })
}

// 批量删除定时任务日志
export function doDeleteLog(data) {
    return $http({
        url: 'sys/scheduleLog/delete',
        method: 'post',
        data
    })
}
