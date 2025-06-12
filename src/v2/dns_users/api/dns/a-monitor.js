import { $http, $qs } from '../../request'

/** ==================================
 *        轮询IP管理
 *  ==================================
 */
export function getPollList(params) {
  return $http({
    url: 'app/monitor/poll/ip/list',
    method: 'get',
    params
  })
}

// 开关轮询IP
export function changePollStatus(params) {
  return $http({
    url: 'app/monitor/poll/ip/status/change',
    method: 'get',
    params
  })
}

// 批量添加轮询IP
export function doCreatePoll(data) {
  return $http({
    url: 'app/monitor/poll/ip/batch/create',
    method: 'post',
    data
  })
}

// 修改轮询IP
export function doUpdatePoll(data) {
  return $http({
    url: 'app/monitor/poll/ip/update',
    method: 'post',
    data
  })
}

// 批量删除轮询IP
export function doDelPoll(data) {
  return $http({
    url: 'app/monitor/poll/ip/delete',
    method: 'post',
    data
  })
}

/** ==================================
 *        监控任务管理
 *  ==================================
 */
// 监控任务列表
export function getTaskList(params) {
  return $http({
    url: 'app/monitor/task/list',
    method: 'get',
    params
  })
}

// 添加监控任务
export function doCreateTask(data) {
  return $http({
    url: 'app/monitor/task/create',
    method: 'post',
    data
  })
}

// 修改监控任务
export function doUpdateTask(data) {
  return $http({
    url: 'app/monitor/task/update',
    method: 'post',
    data
  })
}

// 监控任务开关
export function doToggleTaskStatus(params) {
  return $http({
    url: 'app/monitor/task/status/change',
    method: 'get',
    params
  })
}

// 批量删除监控任务
export function doDelTask(data) {
  return $http({
    url: 'app/monitor/task/delete',
    method: 'post',
    data
  })
}

// 可根据任务ID 或者 记录id rdataId 获取监控任务详情
export function getTaskInfo(params) {
  return $http({
    url: 'app/monitor/task/info',
    method: 'get',
    params
  })
}

/** ==================================
 *        A 监控
 *  ==================================
 */
// 获取A监控调度列表
export function getRuleList(data) {
  return $http({
    url: 'app/dns/a/monitor/getRuleList',
    method: 'post',
    data
  })
}

// 获取域名或记录数据
export function getDomainOrRecordList(data) {
  return $http({
    url: 'app/dns/a/monitor/getDomainOrRecordList',
    method: 'post',
    data
  })
}

// 批量修改状态
export function updateStatus(data) {
  return $http({
    url: 'app/dns/a/monitor/rule/status/update',
    method: 'post',
    data
  })
}

// 查询监控状态: taskId
export function getCallbackInfo(params) {
  return $http({
    url: 'app/dns/a/monitor/get/callback/info',
    method: 'get',
    params
  })
}

// 获取A监控调度监控详情
export function getTaskMonitor(params) {
  return $http({
    url: 'app/dns/a/monitor/getTaskMonitor',
    method: 'get',
    params
  })
}

// 保存A监控调度
export function saveRule(data) {
  return $http({
    url: 'app/dns/a/monitor/saveRule',
    method: 'post',
    data
  })
}

// 保存A监控监控
export function saveTaskMonitor(data) {
  return $http({
    url: 'app/dns/a/monitor/saveTaskMonitor',
    method: 'post',
    data
  })
}

// 删除A监控调度
export function deleteRule(data) {
  return $http({
    url: 'app/dns/a/monitor/deleteRule',
    method: 'post',
    data
  })
}

// A监控管理备IP：添加 | 修改 | 删除备IP
export function defineBackSave(data) {
  return $http({
    url: 'app/dns/a/monitor/self/define/back/save',
    method: 'post',
    data
  })
}
