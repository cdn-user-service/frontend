import { $http, $qs } from '../../request'

// 分页获取站点列表
export function getSiteList(data) {
  return $http({
    url: 'app/site/list',
    method: 'post',
    data
  })
}

// 获取用户所有域名
export function getAllDomain(params) {
  return $http({
    url: 'app/site/list/all',
    method: 'get',
    params
  })
}

// 创建站点
export function doCreateSite(data) {
  return $http({
    url: 'app/site/create',
    method: 'post',
    data
  })
}

// 批量创建站点，多个站点以 逗号 分隔
export function doBatchCreateSite(data) {
  return $http({
    url: 'app/site/batcreate',
    method: 'post',
    data
  })
}

// 创建站点-检查站点是否存在
export function checkCreateSite(params) {
  return $http({
    url: 'app/site/site/name/check',
    method: 'get',
    params
  })
}

// 批量删除站点
export function dobatchDeleteSite(data) {
  return $http({
    url: 'app/site/delete',
    method: 'post',
    data
  })
}

// 站点状态开关
export function doChangeSiteStatus(params) {
  return $http({
    url: 'app/site/site/change/status',
    method: 'get',
    params
  })
}

/* =====================================
 *       站点管理相关
 *  =====================================
 */
// 根据站点id导出
export function doExportSite(data) {
  return $http({
    url: 'app/site/bat/export',
    method: 'post',
    data
  })
}

// 根据 站点 id ,类型 group 获取站点详情
export function getSiteDetailById(data) {
  return $http({
    url: 'app/site/detail',
    method: 'post',
    data
  })
}

// 保存站点属性配置，可以批量保存，也可以单个保存，
export function doCreateUpdateSiteAttr(data) {
  return $http({
    url: 'app/site/SaveSiteAttr',
    method: 'post',
    data
  })
}

// 删除站点某个属性列表的一项值
export function doDeleteSiteAttr(data) {
  return $http({
    url: 'app/site/delete/attr',
    method: 'post',
    data
  })
}

// 修改站点某个属性的状态
export function changeAttrStatus(data) {
  return $http({
    url: 'app/site/ChangeAttrStatus',
    method: 'post',
    data
  })
}

// 修改站点表格数据的排序
export function changeAttrWeight(data) {
  return $http({
    url: 'app/site/ChangeAttrWeight',
    method: 'post',
    data
  })
}

// 变更套餐
export function doTogglePlan(data) {
  return $http({
    url: 'app/site/site/change/suit',
    method: 'post',
    data
  })
}

// 自动生成WAF规则
export function buildWafRule(data) {
  return $http({
    url: 'app/site/build/sys/waf/rule',
    method: 'post',
    data
  })
}

/* =====================================
 *       证书管理相关
 *  =====================================
 */
// 获取证书统计
export function getCertifyStatistics() {
  return $http({
    url: 'app/certify/statistics',
    method: 'get'
  })
}

// 获取证书列表
export function getCertifyList(data) {
  return $http({
    url: 'app/certify/list',
    method: 'post',
    data
  })
}

// 添加、修改 证书
export function doCreateUpdateCertify(data) {
  return $http({
    url: 'app/certify/save',
    method: 'post',
    data
  })
}

// 批量删除证书
export function doDeleteCertify(data) {
  return $http({
    url: 'app/certify/batDelete',
    method: 'post',
    data
  })
}

// 根据证书ID获取证书详情
export function getCertifyDetail(params) {
  return $http({
    url: 'app/certify/detail',
    method: 'get',
    params
  })
}

// 根据 host 获取证书
export function getCertifyByHost(params) {
  return $http({
    url: 'app/certify/get/certify/by/host',
    method: 'get',
    params
  })
}

// 证书重签 CertId
export function doReauthCertify(data) {
  return $http({
    url: 'app/certify/reauth',
    method: 'post',
    data
  })
}

// 添加证书，
export function doCreateCert(data) {
  return $http({
    url: 'app/certify/zero/api/create/cert',
    method: 'post',
    data
  })
}

// 站点内申请和重签证书
export function doApplyCert(data) {
  return $http({
    url: 'app/certify/apply/certificate',
    method: 'post',
    data
  })
}

// 站点内批量申请证书
export function reIssued(data) {
  return $http({
    url: 'app/site/cert/bat/re_issued',
    method: 'post',
    data
  })
}

/* =====================================
 *       缓存清理相关
 *  =====================================
 */
// 根据 urls 清理缓存
export function doClearCache(data) {
  return $http({
    url: 'app/site/site/clean/cache',
    method: 'post',
    data
  })
}

// 缓存预热
export function doPreheat(data) {
  return $http({
    url: 'app/site/site/clean/cache',
    method: 'post',
    data
  })
}

/* =====================================
 *       解封IP相关
 *  =====================================
 */
// 当前已解封IP数据
export function getReleaseIpList() {
  return $http({
    url: 'app/site/already/release/short_cc/intercept/list',
    method: 'get'
  })
}

// 解封IP
export function doReleaseIps(data) {
  return $http({
    url: 'app/site/release/short_cc/intercept/ips',
    method: 'post',
    data
  })
}

// 永久拉黑IP
export function doIpInBlackForever(data) {
  return $http({
    url: '',
    method: 'post',
    data
  })
}

// 分页获取 WAF 封禁拦截详情数据
export function getWafInterceptResult(data) {
  return $http({
    url: 'app/site/site/waf/intercept/result/data',
    method: 'post',
    data
  })
}

/** =====================================
 *              域名分组相关
 *  =====================================
 */

// 获取分组列表
export function getDomainGroupList(data) {
  return $http({
    url: 'app/site/group/list',
    method: 'post',
    data
  })
}

// 创建-修改 域名分组
export function doCreateUpdateDomainGroup(data) {
  return $http({
    url: 'app/site/group/save',
    method: 'post',
    data
  })
}

// 批量删除 域名分组 ids
export function doDeleteDomainGroup(data) {
  return $http({
    url: 'app/site/group/delete',
    method: 'post',
    data
  })
}

// 获取域名未分组域名 by ID
export function getDomainGroupNotin(params) {
  return $http({
    url: 'app/site/domain_group/notin',
    method: 'get',
    params
  })
}

// 获取域名分组详情 by ID
export function getDomainGroupDetail(params) {
  return $http({
    url: 'app/site/domain_group/detail',
    method: 'get',
    params
  })
}

/** =====================================
 *              批量修改站点属性
 *  =====================================
 */
// 批量修改站点属性
export function doBulkUpdateSiteAttr(data) {
  return $http({
    url: 'app/site/batch/modify/site_attr',
    method: 'post',
    data
  })
}

// 批量修改站点属性，搜索指定属性，主要用于源站配置
export function doBulkSearchSiteAttr(data) {
  return $http({
    url: 'app/site/batch/search/modify/site_attr',
    method: 'post',
    data
  })
}

// 获取公共WAF
export function getPubWaf() {
  return $http({
    url: 'app/site/pub/web_rule_precise',
    method: 'get'
  })
}

/** =====================================
 *              批量添加站点属性
 *  =====================================
 */
export function doBulkAddSiteAttr(data) {
  return $http({
    url: 'app/site/batch/add/site_attr',
    method: 'post',
    data
  })
}

/** =====================================
 *              缓存预取
 *  =====================================
 */
export function getCacheList(data) {
  return $http({
    url: 'app/site/prefetch/cache/list',
    method: 'post',
    data
  })
}

// 预取保存
export function doCacheSave(data) {
  return $http({
    url: 'app/site/prefetch/cache/save',
    method: 'post',
    data
  })
}

// 预取删除
export function doCacheDelete(data) {
  return $http({
    url: 'app/site/prefetch/cache/delete',
    method: 'post',
    data
  })
}
