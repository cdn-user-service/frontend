import {
  $http,
  $qs
} from '../../request'

/** ==================================
 *        域名管理
 *  ==================================
 */
// 获取域名列表 
export function getDomainList(params) {
  return $http({
    url: 'app/httpdns/httpdns/list',
    method: 'get',
    params
  })
}

// 添加主域名 
export function doCreateDomain(data) {
  return $http({
    url: 'app/httpdns/poll/ip/list',
    method: 'post',
    data
  })
}

// 批量删除主域名 
export function doDeleteDomain(data) {
  return $http({
    url: 'app/httpdns/poll/ip/list',
    method: 'post',
    data
  })
}

/** ==================================
 *        开发配置
 *  ==================================
 */
// 获取配置信息数据 
export function getConfigureData(data) {
  return $http({
    url: 'app/monitor/poll/ip/list',
    method: 'post',
    data
  })
}

// 获取应用列表 
export function getAppList(params) {
  return $http({
    url: 'app/httpdns/user/config/list',
    method: 'get',
    params
  })
}

// 添加应用
export function doCreateApp(data) {
  return $http({
    url: 'app/httpdns/user/config/save',
    method: 'post',
    data
  })
}

// 批量删除应用 
export function doDeleteApp(data) {
  return $http({
    url: 'app/httpdns/user/config/delete',
    method: 'post',
    data
  })
}
