import { $http, $qs } from '../../request'

// 获取定时任务列表
export function getList(data) {
    return $http({
        url: 'sys/schedule/list',
        method: 'post',
        data
    })
}

// 添加 - 修改定时任务
export function doCreateUpdateSchedule(data, type) {
    return $http({
        url: type === 'update'
        ? 'sys/schedule/update'
        : 'sys/schedule/save',
        method: 'post',
        data
    })
}

// 获取添加修改域名的域名列表
export function getJobBeanList() {
    return $http({
        url: 'sys/schedule/jobBeanList',
        method: 'get'
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
export function getLogList(data) {
    return $http({
        url: 'sys/scheduleLog/list',
        method: 'post',
        data
    })
}
