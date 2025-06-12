// 开发环境
export const debug = process.env.NODE_ENV === 'development'

// 当前项目的名称
// export const appName = process.env.VUE_APP_NAME

// 定制模块mode 176 sudun
//  dnsApiMode 88 xdp
const mode = (window.config || {}).mode
const dnsApiMode = (window.config || {}).dnsApiMode

const modes = mode.toString().split('|')
// const dnsApiModes = dnsApiMode.toString().split('|')

export const $mode = {
  176: debug || mode == 176,
  179: debug || mode == 179,
  '176_179': debug || mode == 176 || mode == 179,
  tw: debug || mode == 'tw',
  // 验证路由权限和具体的权限
  permission(per) {
    return modes.includes(per)
  }
}

export const $dnsApiMode = {
  88: debug || dnsApiMode == 88
  // 验证路由权限和具体的权限
  // permission(per) {
  //   return modes.includes(per)
  // }
}

// 当前站点 url 各部分参数
export function getLocation() {
  return {
    // 整个 url 字符串
    href: window.location.href,
    // 协议
    protocol: window.location.protocol,
    // 主机部分，包含端口
    host: window.location.host,
    // 主机名称，不包含端口
    hostname: window.location.hostname,
    // 端口
    port: window.location.port,
    // url的路径部分，就是文件地址
    pathname: window.location.pathname,
    // 查询参数部分
    search: window.location.search,
    // 井号“#”后面的分段
    hash: window.location.hash
  }
}

// 判断是否为移动端
export function isMobile() {
  const flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  )
  return flag
}

// 获取当前站点的根路径
export function getBaseURL() {
  const { protocol, host } = getLocation()
  return `${protocol}//${host}`
}

// js 打开新窗口
export function openUrl(url = '', isBlank = false) {
  if (!url) return

  // 如果为打开新的窗口
  if (isBlank) {
    window.open(url, '_blank', 'width=800,height=500')
    return
  }

  const tempALink = document.createElement('a')
  tempALink.setAttribute('target', '_blank')
  tempALink.setAttribute('id', 'openUrl')
  tempALink.setAttribute('href', url)
  document.body.appendChild(tempALink)
  document.getElementById('openUrl').click()
  document.body.removeChild(tempALink)
}
