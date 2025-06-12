import { $http, $qs } from '../../request'

/** =================================
 *     反向解析分组
 *  =================================
 */
// 获取反向解析列表
export function getPtrList(data) {
  return $http({
    url: 'sys/dns/ptr/list',
    method: 'post',
    data
  })
}

// 保存、新增and修改反向解析
export function doSavePtr(data) {
  return $http({
    url: 'sys/dns/ptr/save',
    method: 'post',
    data
  })
}

// 批量删除反向解析 ids
export function doBatckDeletePtr(data) {
  return $http({
    url: 'sys/dns/ptr/delete',
    method: 'post',
    data
  })
}

/** =================================
 *     反向解析记录
 *  =================================
 */
