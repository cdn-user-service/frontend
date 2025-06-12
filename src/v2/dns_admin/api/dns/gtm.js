import { $http, $qs } from '../../request'

/** =================================
 *     ip管理
 *  =================================
 */
// 获取IP列表
export function getIpsPage(data) {
  return $http({
    url: 'sys/dns/gtm/source/page',
    method: 'post',
    data
  })
}

// 保存IPS
export function doSaveIps(data) {
  return $http({
    url: 'sys/dns/gtm/source/save',
    method: 'post',
    data
  })
}

// 删除
export function getRecordList(data) {
  return $http({
    url: 'sys/dns/domain/top_type/list',
    method: 'post',
    data
  })
}

// 获取记录列表
export function doDeleteIps(data) {
  return $http({
    url: 'sys/dns/gtm/source/delete',
    method: 'post',
    data
  })
}

/** =================================
 *     规则
 *  =================================
 */
// 获取规则列表
export function getRulePage(data) {
  return $http({
    url: 'sys/dns/gtm/rule/page',
    method: 'post',
    data
  })
}

// 保存规则
export function doSaveRule(data) {
  return $http({
    url: 'sys/dns/gtm/rule/save',
    method: 'post',
    data
  })
}

// 删除规则
export function doDeleteRule(data) {
  return $http({
    url: 'sys/dns/gtm/rule/delete',
    method: 'post',
    data
  })
}

// 根据ID获取规则详情
export function getRuleInfo(params) {
  return $http({
    url: 'sys/dns/gtm/rule/info',
    method: 'get',
    params
  })
}

/** =================================
 *      监控管理
 *  =================================
 */
// 获取监控列表
export function getMonitorPage(data) {
  return $http({
    url: 'sys/dns/gtm/monitor/page',
    method: 'post',
    data
  })
}

// 获取监控详情 taskId
export function getMonitorDetail(params) {
  return $http({
    url: 'sys/dns/gtm/monitor/detail',
    method: 'get',
    params
  })
}

// 保存监控
export function doSaveMonitor(data) {
  return $http({
    url: 'sys/dns/gtm/monitor/save',
    method: 'post',
    data
  })
}

// 删除监控
export function doDeleteMonitor(data) {
  return $http({
    url: 'sys/dns/gtm/monitor/delete',
    method: 'post',
    data
  })
}

/** =================================
 *      新的接口，使用下面的
 *  =================================
 */
// 获取GTM任务列表
export function getGtmTaskList(data) {
  return $http({
    url: 'sys/dns/gtm/task/conf/list',
    method: 'post',
    data
  })
}

// 获取GTM任务详情  taskId
export function getGtmTaskDetail(params) {
  return $http({
    url: 'sys/dns/gtm/task/conf/detail',
    method: 'get',
    params
  })
}

// 单个保存GMT任务和规则，通用的一个接口
export function doSaveGtmTask(data) {
  return $http({
    url: 'sys/dns/gtm/task/conf/save',
    method: 'post',
    data
  })
}

// 删除GTM规则
export function doDelGtmRule(data) {
  return $http({
    url: 'sys/dns/gtm/task/conf/delete',
    method: 'post',
    data
  })
}

// 根据taskId 获取响应时间
export function getCallbackInfo(params) {
  return $http({
    url: 'sys/dns/gtm/source/task/callback/info',
    method: 'get',
    params
  })
}

// 获取所有的A记录和CNAME记录
export function getRecordTypeList(data) {
  return $http({
    url: 'sys/dns/domain/top_type/list',
    method: 'post',
    data
  })
}
