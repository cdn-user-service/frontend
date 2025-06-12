import { $http, $qs } from '../../request'

// 分页获取站点列表
export function getSiteList(data) {
  return $http({
    url: 'sys/cdn/site/list',
    method: 'post',
    data
  })
}

// 创建站点
export function doCreateSite(data) {
  return $http({
    url: 'sys/cdn/site/create',
    method: 'post',
    data
  })
}

// 批量创建站点，多个站点以 逗号 分隔
export function doBatchCreateSite(data) {
  return $http({
    url: 'sys/cdn/site/batcreate',
    method: 'post',
    data
  })
}

// 创建站点-检查站点是否存在
export function checkCreateSite(params) {
  return $http({
    url: 'sys/cdn/site/site/name/check',
    method: 'get',
    params
  })
}

// 批量删除站点
export function dobatchDeleteSite(data) {
  return $http({
    url: 'sys/cdn/site/delete',
    method: 'post',
    data
  })
}

// 站点状态开关
export function doChangeSiteStatus(params) {
  return $http({
    url: 'sys/cdn/site/change/status',
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
    url: 'sys/cdn/site/bat/export',
    method: 'post',
    data
  })
}

// 根据 站点 id ,类型 group, key 获取站点详情
export function getSiteDetailById(data) {
  return $http({
    url: 'sys/cdn/site/detail',
    method: 'post',
    data
  })
}

// 保存站点属性配置，可以批量保存，也可以单个保存，
export function doCreateUpdateSiteAttr(data) {
  return $http({
    url: 'sys/cdn/site/SaveSiteAttr',
    method: 'post',
    data
  })
}

// 删除站点某个属性列表的一项值
export function doDeleteSiteAttr(data) {
  return $http({
    url: 'sys/cdn/site/delete/attr',
    method: 'post',
    data
  })
}

// 修改站点某个属性的状态
export function changeAttrStatus(data) {
  return $http({
    url: 'sys/cdn/site/ChangeAttrStatus',
    method: 'post',
    data
  })
}

// 修改站点表格数据的排序
export function changeAttrWeight(data) {
  return $http({
    url: 'sys/cdn/site/ChangeAttrWeight',
    method: 'post',
    data
  })
}

// 变更套餐
export function doTogglePlan(data) {
  return $http({
    url: 'sys/cdn/site/change/suit',
    method: 'post',
    data
  })
}

// 自动生成WAF规则
export function buildWafRule(data) {
  return $http({
    url: 'sys/cdn/site/build/sys/waf/rule',
    method: 'post',
    data
  })
}

// 获取节点分组
export function getDomainGroupList(data) {
  return $http({
    url: 'sys/cdnsys/auth/client/area/list',
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
    url: 'sys/certify/statistics',
    method: 'get'
  })
}

// 获取证书列表
export function getCertifyList(data) {
  return $http({
    url: 'sys/certify/list',
    method: 'post',
    data
  })
}

// 添加、修改 证书
export function doCreateUpdateCertify(data) {
  return $http({
    url: 'sys/certify/save',
    method: 'post',
    data
  })
}

// 批量删除证书
export function doDeleteCertify(data) {
  return $http({
    url: 'sys/certify/batDelete',
    method: 'post',
    data
  })
}

// 根据证书ID获取证书详情
export function getCertifyDetail(params) {
  return $http({
    url: 'sys/certify/detail',
    method: 'get',
    params
  })
}

// 证书重签 id
export function doReauthCertify(data) {
  return $http({
    url: 'sys/certify/reauth',
    method: 'post',
    data
  })
}

// 根据 host 获取证书
export function getCertifyByHost(params) {
  return $http({
    url: 'sys/certify/get/certify/by/host',
    method: 'get',
    params
  })
}

// 添加证书，
export function doCreateCert(data) {
  return $http({
    url: 'sys/certify/zero/api/create/cert',
    method: 'post',
    data
  })
}

// 站点内申请和重签证书
export function doApplyCert(data) {
  return $http({
    url: 'sys/certify/apply/certificate',
    method: 'post',
    data
  })
}

// 站点内批量申请证书
export function reIssued(data) {
  return $http({
    url: 'sys/cdn/site/cert/bat/re_issued',
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
    url: 'sys/cdn/site/site/clean/cache',
    method: 'post',
    data
  })
}

// 缓存预热
export function doPreheat(data) {
  return $http({
    url: 'sys/cdn/site/pull/cache',
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
    url: 'sys/cdnsys/auth/already/release/short_cc/intercept/list',
    method: 'get'
  })
}

// 解封IP
export function doReleaseIps(data) {
  return $http({
    url: 'sys/cdnsys/auth/release/short_cc/intercept/ips',
    method: 'post',
    data
  })
}

// 永久拉黑IP { id=0, ip='', remark='', control=(1=白名单、2=7层拦截、3=3层临时封禁、4=3层永久拉黑)}
export function doIpInBlackForever(data) {
  return $http({
    url: 'sys/cdnsys/ip/control/save',
    method: 'post',
    data
  })
}

// 分页获取 WAF 封禁拦截详情数据
export function getWafInterceptResult(data) {
  return $http({
    url: 'sys/cdn/site/site/waf/intercept/result/data',
    method: 'post',
    data
  })
}

/** =====================================
 *              批量修改站点属性
 *  =====================================
 */
// 批量修改站点属性
export function doBulkUpdateSiteAttr(data) {
  return $http({
    url: 'sys/cdn/site/batch/modify/site_attr',
    method: 'post',
    data
  })
}

// 批量修改站点属性，搜索指定属性，主要用于源站配置
export function doBulkSearchSiteAttr(data) {
  return $http({
    url: 'sys/cdn/site/batch/search/modify/site_attr',
    method: 'post',
    data
  })
}

// 获取公共WAF
export function getPubWaf() {
  return $http({
    url: 'sys/cdn/public/nginx/attr/key/detail',
    method: 'post',
    data: {
      key: 'web_rule_precise'
    }
  })
}

/** =====================================
 *              批量添加站点属性
 *  =====================================
 */
export function doBulkAddSiteAttr(data) {
  return $http({
    url: 'sys/cdn/site/batch/add/site_attr',
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
    url: 'sys/cdn/site/prefetch/cache/list',
    method: 'post',
    data
  })
}

// 预取保存
export function doCacheSave(data) {
  return $http({
    url: 'sys/cdn/site/prefetch/cache/save',
    method: 'post',
    data
  })
}
// 预取删除
export function doCacheDelete(data) {
  return $http({
    url: 'sys/cdn/site/prefetch/cache/delete',
    method: 'post',
    data
  })
}
