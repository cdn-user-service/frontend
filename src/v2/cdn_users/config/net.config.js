const { debug } = require('@/utils/env')
// const apiRoot = '/antsxdp/'
// const apiRoot = '/api/'
const resetAPI = (window.config || {}).resetAPI
const apiRoot = resetAPI ? '/api/' : '/antsxdp/'


module.exports = {
  // 接口请求的根路径
  apiRoot,
  // 默认的接口地址，开发环境和生产环境都会走
  // 正式项目可以选择自己配置成需要的接口地址
  baseURL: debug ? `/cdn_api${apiRoot}` : apiRoot,
  // baseURL: apiRoot,
  // 配后端数据的接收方式application/json;charset=UTF-8 或 application/x-www-form-urlencoded;charset=UTF-8
  contentType: 'application/json;charset=UTF-8',
  // 缓存设置
  CacheControl: 'no-cache',
  // 最长请求时间
  requestTimeout: 5 * 60 * 1000,
  // 操作正常code，支持String、Array、int多种类型
  successCode: [1, 0, '1', '0'],
  // 数据状态的字段名称
  statusName: 'code',
  // 状态信息的字段名称
  messageName: 'msg',
  // 跨域请求是否提供凭据信息
  withCredentials: true
}
