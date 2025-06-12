import { $http, $qs } from '../../request'

// 获取域名列表
export function getList(data) {
  return $http({
    url: 'sys/dns/GetDomainList',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 添加域名 - 修改（ 主要为变更套餐） - 删除域名 operation_type = add | update | delete
export function doCreate(data) {
  return $http({
    url: 'sys/dns/SaveDomain',
    method: 'post',
    data: $qs.stringify(data)
  })
}

// 开启-暂停域名解析状态
export function doUpdateDomainStatus(params) {
  return $http({
    url: 'sys/dns/UpdateDomainStatus',
    method: 'get',
    params
  })
}

// 批量修改域名解析状态
export function doUpdateDomainStatusBulk(data) {
  return $http({
    url: 'sys/dns/update/domain/status',
    method: 'post',
    data
  })
}

// 查看解析状态
export function getJwhois(params) {
  return $http({
    url: 'sys/dns/GetJwhois',
    method: 'get',
    params
  })
}

// 获取域名信息
export function getDomainInfo(params) {
  return $http({
    url: 'sys/dns/GetDomainInfoById',
    method: 'get',
    params
  })
}

// 批量删除域名
export function doBatchDeleteDomain(data) {
  return $http({
    url: 'sys/dns/BatchDeleteDomain',
    method: 'post',
    headers: {
      post: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    },
    data
  })
}

// 解除异常信息
export function doReleaseDomain(params) {
  return $http({
    url: 'sys/dns/ReleaseBanDomain',
    method: 'get',
    params
  })
}

// 修改域名单个属性，直接传递域名id 和 属性
export function doUpdateDomainAttr(data) {
  return $http({
    url: 'sys/dns/domain/update/attr',
    method: 'post',
    data
  })
}

// 更新域名CNAME加速状态（开启=1，暂停=0），不用，用下面的
export function doSwitchCnameStatus(params) {
  return $http({
    url: 'sys/dns/domainCnameAccelerateStatus/update',
    method: 'get',
    params
  })
}

// 根据域名id和key属性更新域名参数：CNAME加速、TTL默认值、递归解析急速、搜索引擎优化
export function doSaveDomainAttr(data) {
  return $http({
    url: 'sys/dns/control/attr/save',
    method: 'post',
    data
  })
}

// 全部推送
export function doPushAll(params) {
  return $http({
    url: 'sys/dns/init/xadd/domain/record',
    method: 'get',
    params
  })
}
