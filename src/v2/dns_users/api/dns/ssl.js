import { $http, $qs } from '../../request'

/** =================================
 *           SSL订单
 *  =================================
 */
// 获取SSL已有证书列表，不用
export function getSslCertPage(data) {
  return $http({
    url: 'app/rc/ssl/cert/page',
    method: 'post',
    data
  })
}

// 证书统计看板
export function getSslDashboard() {
  return $http({
    url: 'app/rc/ssl/dashboard',
    method: 'get'
  })
}

// 根据certId 获取证书详情
export function getSslCertDetail(params) {
  return $http({
    url: 'app/rc/ssl/get/collect/status',
    method: 'get',
    params
  })
}

// 证书取消订阅
export function doCancelSslCert(data) {
  return $http({
    url: 'app/rc/ssl/cert/cancel',
    method: 'post',
    data
  })
}

// 修改订书申请中的域名验证方式
export function doUpdateSslDcv(data) {
  return $http({
    url: 'app/rc/ssl/user/update/dcv',
    method: 'post',
    data
  })
}

// 下载SSL证书  certId，签发成功后才能下载
export function doDownloadSslCert(params) {
  return $http({
    url: 'app/rc/ssl/cert/download',
    method: 'get',
    params,
    // 指定响应的数据类型为 blob，不指定的话会解压不出来
    responseType: 'blob'
  })
}

// 下载验证文件
export function doDownloadDcv() {
  return $http({
    url: 'app/rc/ssl/pending/ssl/dcvinfo',
    method: 'get'
  })
}

// 删除申请中的SSL的域名
export function doRemoveSslDomain(data) {
  return $http({
    url: 'app/rc/ssl/user/remove/domain',
    method: 'post',
    data
  })
}

// DNS验证 certId
export function doValidateDNS(params) {
  return $http({
    url: 'app/rc/ssl/validate/dns',
    method: 'get',
    params
  })
}
/** =================================
 *           SSL订单-免费证书
 *  =================================
 */
// 免费证书统计
export function getFreeStatistics() {
  return $http({
    url: 'app/pay/query/ssl/statistics',
    method: 'get'
  })
}

// 获取免费证书内容  orderId
export function getFreeSslDetail(params) {
  return $http({
    url: 'app/rc/ssl/user/view/free/ssl',
    method: 'get',
    params
  })
}

// 免费证书重签  orderId
export function renewFreeSsl(data) {
  return $http({
    url: 'app/rc/ssl/user/renew/free/ssl',
    method: 'post',
    data
  })
}

// 申请免费证书
export function applyFreeSsl(data) {
  return $http({
    url: 'app/rc/ssl/user/buy/free/ssl',
    method: 'post',
    data
  })
}

// 免费证书验证DNS
export function verifyFreeSsl(params) {
  return $http({
    url: 'app/rc/ssl/user/continue/free/ssl',
    method: 'get',
    params
  })
}

// API申请免费证书
export function doCreateCert(data) {
  return $http({
    url: 'app/rc/ssl/zero/api/create/cert',
    method: 'post',
    data
  })
}

/** =================================
 *           SSL套餐
 *  =================================
 */
// 获取SSL套餐列表，这个接口还没有
export function getSslPlanList(data) {
  return $http({
    url: 'app/rc/ssl/product/list',
    method: 'post',
    data
  })
}

// 证书购买下单
export function doBuySsl(data) {
  return $http({
    url: 'app/rc/ssl/user/buy/ssl',
    method: 'post',
    data
  })
}

// SSL 证书购买续费下单
export function doRenewSsl(data) {
  return $http({
    url: 'app/rc/ssl/user/renew/ssl',
    method: 'post',
    data
  })
}

// 根据联系人信息生成CSR
export function generateCrs(data) {
  return $http({
    url: 'app/rc/ssl/cert/generate/csr',
    method: 'post',
    data
  })
}

/** =================================
 *           SSL 联系人
 *  =================================
 */
// 获取联系人列表
export function getSslContactPage(data) {
  return $http({
    url: 'app/rc/ssl/contact/page',
    method: 'post',
    data
  })
}

// 获取联系人列表
export function doSaveSslContact(data) {
  return $http({
    url: 'app/rc/ssl/contact/save',
    method: 'post',
    data
  })
}

// 获取联系人列表
export function doDelSslContact(data) {
  return $http({
    url: 'app/rc/ssl/contact/delete',
    method: 'post',
    data
  })
}

/** =================================
 *           SSL 联系公司
 *  =================================
 */
// 获取公司列表
export function getSslOrganizationPage(data) {
  return $http({
    url: 'app/rc/ssl/organization/page',
    method: 'post',
    data
  })
}

// 获取公司列表
export function doSaveOrganization(data) {
  return $http({
    url: 'app/rc/ssl/organization/save',
    method: 'post',
    data
  })
}

// 获取公司列表
export function doDelSslOrganization(data) {
  return $http({
    url: 'app/rc/ssl/organization/delete',
    method: 'post',
    data
  })
}
