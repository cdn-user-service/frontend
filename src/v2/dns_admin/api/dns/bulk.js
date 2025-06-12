import { $http, $qs } from '../../request'

// 批量添加域名
export function batchCreateDomains(data) {
  return $http({
    url: 'sys/dns/BatchCreateDomain',
    method: 'post',
    data
  })
}

// 获取取回域名记录参数
export function getRetrieveKeyValue(params) {
  return $http({
    url: 'app/dns/get/retrieve/keyvalue',
    method: 'get',
    params
  })
}

// 批量取回域名
export function batchRetrieveDomains(data) {
  return $http({
    url: 'app/dns/batch/retrieve/domain',
    method: 'post',
    data
  })
}

// 批量修改套餐 /sys/dns/batch/update/record
export function batckDomainUpdate(data) {
  return $http({
    url: 'sys/dns/batch/update/record',
    method: 'post',
    data
  })
}

// 批量多域名添加解析记录
export function batchMultidomainRecords(data) {
  return $http({
    url: 'sys/dns/BatchMultidomainRecordSet',
    method: 'post',
    data
  })
}

// 批量多域名添加解析记录 V2
export function batckInsertRecords(data) {
  return $http({
    url: 'sys/dns/record/mut/insert',
    method: 'post',
    data
  })
}

// 批量清空解析记录
export function batchDeleteRecords(data) {
  return $http({
    url: 'sys/dns/record/mut/clean',
    method: 'post',
    data
  })
}

// 批量JSON文件导入添加解析记录
export function batchCreateRecords(domain, file) {
  return $http({
    url: `sys/dns/BatchImportRecordsSet?domain=${domain}`,
    method: 'post',
    data: file,
    timeout: 5 * 60 * 1000 // 设置超时时间为 5分钟
  })
}

// 获取批量操作日志
export function getBatchLogList(data) {
  return $http({
    url: 'sys/dns/GetBatchLogList',
    method: 'post',
    data
  })
}

// 根据ID获取操作日志详情
export function getBatchLogDetail(params) {
  return $http({
    url: 'sys/dns/getBatLogResultDetail',
    method: 'get',
    params
  })
}

// 删除批量操作日志
export function doDeteleBatchLog(params) {
  return $http({
    url: 'sys/dns/deleteBatchlog',
    method: 'get',
    params
  })
}
