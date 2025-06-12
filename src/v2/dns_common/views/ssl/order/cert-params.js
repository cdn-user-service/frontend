// 订单状态或者证书状态
export const CERT_STATUS = {
  PENDING: '申请中',
  COMPLETE: '已签发',
  CANCELLED: '已取消',
  REISSUED: '已重签',
  FAILED: '申请失败',
  RENEWED: '已续费',
  REVOKED: '已吊销'
}

// 域名验证方式
export const DCV_METHOD = {
  // 'EMAIL': '邮箱验证',
  CNAME_CSR_HASH: 'DNS验证',
  HTTP_CSR_HASH: '文件验证',
  HTTPS_CSR_HASH: 'HTTP验证'
}
