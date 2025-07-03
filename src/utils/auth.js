import { MessageBox } from 'element-ui'
import { windowTranslateTitle } from '@/utils/i18n'

// 指定唯一的key，系统可能会部署在同一个域下面
const APP_NAME = process.env.VUE_APP_NAME
console.log('[DEBUG] APP_NAME:', APP_NAME)
export const TOKEN_KEY = `${APP_NAME}_token`
export const USER_KEY = `${APP_NAME}_user`

export const isLogin = () => {
  // 不连后端模式下，始终返回已登录状态
  if (process.env.VUE_APP_USE_MOCK === 'true') {
    return true
  }
  return !!localStorage.getItem(TOKEN_KEY)
}

export const getToken = () => {
  // 只前端模式下，如果没有token则返回一个开发测试token
  const token = localStorage.getItem(TOKEN_KEY)

  if (process.env.VUE_APP_USE_MOCK === 'true' && !token) {
    token = 'dev_token_for_testing'
  }
  // console.log('[getToken] 获取到的token:', token)
  return token
}

export const getUser = () => {
  // 只前端模式下，如果没有用户则返回一个开发测试用户
  if (process.env.VUE_APP_USE_MOCK === 'true' && !localStorage.getItem(USER_KEY)) {
    return 'dev_user'
  }
  return localStorage.getItem(USER_KEY)
}

// localStorage | sessionStorage
export const setToken = (token = '', username = '') => {
  // sessionStorage.setItem('users', username)
  // sessionStorage.setItem('token', token)
  console.log('[setToken] writing to localStorage:')
  console.log('→ USER_KEY:', USER_KEY, 'value:', username)
  console.log('→ TOKEN_KEY:', TOKEN_KEY, 'value:', token)

  localStorage.setItem(USER_KEY, username)
  return localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = () => {
  localStorage.removeItem(USER_KEY)
  return localStorage.removeItem(TOKEN_KEY)
}

export const clearSession = () => {
  window.sessionStorage.clear()
  return window.localStorage.clear()
}

// 使用 localStorage 需要保持单用户登录
// 监听 storage， storage 事件在同一域名下的不同窗口或标签页间共享 localStorage 时触发
// 如果在同一窗口或标签页中修改 localStorage，则不会触发 storage 事件。此外，对 sessionStorage 的修改也不会触发该事件
window.addEventListener('storage', (e) => {
  // 只前端模式下不响应storage事件
  if (process.env.VUE_APP_USE_MOCK === 'true') {
    return
  }
  if (e.key === TOKEN_KEY) {
    if (e.newValue) {
      // 账号变更
      tokenTips({
        title: '登录账号变更！',
        msg: '当前登录账号发生了变更，请刷新页面以便获取最新内容。',
        okText: '刷新页面'
      })
    } else {
      tokenTips({
        title: '登录过期！',
        msg: '登录已过期，您需要重新登录！',
        okText: '重新登录'
      })
    }
  }
})

// 路由白名单，不显示提示
const whiteList = ['/login', '/register', '/forget', '/reset-password']
let tokenTipsSum = 0
let openType = null
export function tokenTips({
  title = '',
  msg = '',
  okText = '',
  // 只提示一次，接口请求验证的时候为 2
  type = 1
}) {
  // 只前端模式下不显示提示
  if (process.env.VUE_APP_USE_MOCK === 'true') {
    return
  }
  const isWhite = whiteList.some((item) => {
    if (location.hash.indexOf(item) != -1) {
      return true
    }
  })
  if (isWhite) {
    closeTips()
    return
  }

  // 有多个接口请求时始终只显示一个
  if (openType == 2 && type == 2) return
  openType = type

  openTips({
    title,
    msg,
    okText
  })
}

export function openTips({ title = '', msg = '', okText = '' }) {
  closeTips()
  tokenTipsSum++

  MessageBox.alert(windowTranslateTitle(msg), windowTranslateTitle(title), {
    center: true,
    type: 'info',
    showClose: false,
    customClass: 'ants-alert',
    confirmButtonText: okText,
    callback: () => {
      location.reload()
    }
  })

  setTimeout(() => {
    const child = document.querySelector('.ants-alert')
    const parent = child.parentElement
    parent.style.zIndex = 999999999
    parent.style.background = 'rgba(0,0,0,0.2)'
  }, 100)
}

export function closeTips() {
  // 先关闭再开启，保持始终一个窗口
  if (tokenTipsSum > 0) MessageBox.close()
}
