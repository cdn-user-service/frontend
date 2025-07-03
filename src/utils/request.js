// 导入axios 并设置全局根路径
import axios from 'axios'
// 全局引入qs 解决post传参格式问题
import Qs from 'qs'
import Vue from 'vue'

// 导入 nprogress 对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { windowTranslateTitle } from '@/utils/i18n'
import { getToken, removeToken, tokenTips, setToken } from '@/utils/auth'



const PROCESS_NAME = process.env.VUE_APP_NAME
// const router = require(`@/v2/${PROCESS_NAME}/router`)
const {
  baseURL,
  requestTimeout,
  CacheControl,
  withCredentials,
  messageName,
  contentType,
  statusName,
  successCode
} = require(`@/v2/${PROCESS_NAME}/config`)

const CODE_MESSAGE = {
  0: '服务器返回数据失败',
  1: '服务器成功返回请求数据',
  401: '用户没有权限(令牌失效、用户名、密码错误、登录过期)',
  403: '用户得到授权，但是访问是被禁止的',
  404: '访问资源不存在',
  500: '请求数据异常',

  201: '新建或修改数据成功',
  202: '一个请求已经进入后台排队(异步任务)',
  204: '删除数据成功',
  400: '发出信息有误',
  402: '令牌过期',
  406: '请求格式不可得',
  410: '请求资源被永久删除，且不会被看到',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时'
}

axios.defaults.withCredentials = withCredentials
axios.defaults.timeout = requestTimeout
axios.defaults.baseURL = baseURL
//  配置post 请求参数格式, TODO 后台接口没有统一，暂时不用
// axios.defaults.headers.post['Content-Type'] = contentType

axios.defaults.headers.common['Cache-Control'] = CacheControl

console.log('[加载 request.js]')
console.log('我们axios用的url就是：', axios.defaults.baseURL)
/**
 * @description: 优化，切换路由前中断前面所有请求
 */
const CancelToken = axios.CancelToken
Vue.$httpRequestList = []
// 防止重复请求
const removePending = config => {
  for (const k in Vue.$httpRequestList) {
    if (Vue.$httpRequestList[k].u === config.url + '&' + config.method) {
      // 当前请求在数组中存在时执行函数体
      Vue.$httpRequestList[k].f() // 执行取消操作
      Vue.$httpRequestList.splice(k, 1) // 把这条记录从数组中移除
    }
  }
}

// console.log('现在VUE_APP_USE_MOCK是什么：', process.env.VUE_APP_USE_MOCK)

// 只前端模式下设置模拟token
if (process.env.VUE_APP_USE_MOCK === 'true') {
  const devToken = 'dev_token_for_testing'
  const devUser = 'dev_user'
  setToken(devToken, devUser)
  console.log('只前端模式：已设置模拟token和用户信息')
}

/**
 * @description: 请求拦截器
 *  通过 axios 请求拦截器添加 token， 保证拥有获取数据的权限
 *  在 request 拦截器中，展示年进度条 NProgress.start()
 */
/**
 * @description: 请求拦截器 - 修复版本
 */
const requestConfig = config => {
  const token = getToken()
  // console.log('[详细检查] 请求URL:', config.url)
  // console.log('[详细检查] Token值:', token)

  // 这个是 优化，切断页面前中断前面所有请求 通过axios cancelToken 关键代码
  config.cancelToken = new CancelToken(cancel => {
    Vue.$httpRequestList.push({
      u: config.url + '&' + config.method,
      f: cancel
    })
  })

  // 不需要 token 的接口路径（可继续扩展）
  const noTokenUrls = [
    '/login',
    '/regist',
    '/kaptcha.jpg',
    '/captcha.jpg'
  ]

  const isNoTokenUrl = noTokenUrls.some(url =>
    config.url.includes(url)
  )

  // 如果不是不需要 token 的接口，并且token存在，则添加 token
  if (!isNoTokenUrl && token) {
    // 修复：使用已经获取的token变量，而不是再次调用getToken()
    config.headers.token = token

    // 同时尝试标准的Authorization格式，以防后端期望这种格式
    config.headers.Authorization = `Bearer ${token}`

    // console.log('[设置后] 设置后的token字段:', config.headers.token)
    // console.log('[设置后] 设置后的Authorization字段:', config.headers.Authorization)
  } else if (!isNoTokenUrl && !token) {
    console.warn('[警告] 需要token但token不存在，URL:', config.url)
  }

  // 在最后必须return config
  return config
}
/**
 * @description: axios响应拦截器
 * @param config 请求配置
 * @returns {Promise<*|*>}
 */
// let noTokenAlertBox = null // 保证只显示一次提示信息

const responseConfig = config => {
  // removePending(config)
  // 隐藏进度条 NProgress.done()
  // NProgress.done()

  // 只前端模式下模拟成功响应
  if (process.env.VUE_APP_USE_MOCK === 'true' && config.data.code === 401) {
    console.log('只前端模式：拦截到401响应，已转换为成功响应')
    config.data.code = 1
    return Promise.resolve(config)
  }

  // 根据 返回  code 判断
  // code： 1 = 请求数据成功， 0 = 请求数据失败， 401 = 用户没有权限(令牌失效、用户名、密码错误、登录过期)
  if (config.data.code != 1) {
    // 保证只显示一次提示信息
    if (config.data.code === 401) {
      removeToken()

      tokenTips({
        title: '登录过期',
        msg: '登录已过期，您需要重新登录！',
        okText: '重新登录',
        type: 2
      })
    } else {
      // 其他请求失败情况
      Vue.prototype.$msg.error(config.data[messageName] + ' ☺' || '请求异常！')
    }
  }

  // 在最后必须return config
  if (config.status === 200) {
    return Promise.resolve(config)
  } else {
    return Promise.reject(config)
  }
}

// 用于防止重复弹出登录过期提示
let isTokenExpiredHandling = false

/**
 * @description axios请求拦截器
 */
axios.interceptors.request.use(requestConfig, error => {
  return Promise.reject(error)
})

/**
 * @description axios响应拦截器
 */
axios.interceptors.response.use(
  // 成功响应处理
  response => responseConfig(response),
  error => {
    const { data, config } = error?.response || {}

    // 只前端模式下模拟成功响应 - 修复了 response 未定义的问题
    if (process.env.VUE_APP_USE_MOCK === 'true' && data?.code === 401) {
      console.log('只前端模式：拦截到401响应，已转换为成功响应')
      data.code = 1
      return Promise.resolve(error.response) // ✅ 修复：使用 error.response
    }

    console.log('响应错误:', error)

    // 成功响应直接返回
    if (data?.code === 1) {
      return Promise.resolve(error.response)
    }

    // 检查是否是登录相关接口
    const isLoginUrl = config?.url && (config.url.includes('/login') || config.url.includes('/regist'))

    // 如果是登录接口返回 401，说明用户名密码错误，直接返回原响应让组件处理
    if (data?.code === 401 && isLoginUrl) {
      // 不显示错误信息，让登录组件自己处理
      return Promise.resolve(error.response)
    }

    // 其他接口的 401 错误，表示 token 过期
    if (data?.code === 401 && !isTokenExpiredHandling) {
      isTokenExpiredHandling = true
      removeToken()

      tokenTips({
        title: '登录过期',
        msg: '登录已过期，您需要重新登录！',
        okText: '重新登录',
        type: 2
      })

      // 延迟重置标志，避免快速重复请求时重复弹窗
      setTimeout(() => {
        isTokenExpiredHandling = false
      }, 1000)

      return new Promise(() => { })
    }

    // 其他错误码处理
    if (data?.code && data.code !== 1) {
      Vue.prototype.$msg.error(data[messageName] || '请求异常！')
      // 返回一个标记失败的 resolved Promise，避免错误冒泡
      return Promise.resolve({ ...error.response, __requestFailed: true })
    }

    // HTTP状态码错误处理（网络错误等）
    if (axios.isCancel(error)) {
      return new Promise(() => { }) // 取消请求时中断链
    }

    const status = error?.response?.status
    const httpData = error?.response?.data || {}

    // 只前端模式下的处理
    if (process.env.VUE_APP_USE_MOCK === 'true' && status === 401) {
      console.log('只前端模式：拦截到HTTP 401响应，已转换为成功响应')
      const mockResponse = {
        data: { code: 1, message: 'Mock success' },
        status: 200,
        config: error.config
      }
      return Promise.resolve(mockResponse)
    }

    // 检查是否是登录相关接口
    const isLoginUrlHttp = config?.url && (config.url.includes('/login') || config.url.includes('/regist'))

    // 如果是登录接口的 401 错误，说明用户名密码错误，直接返回让组件处理
    if (status === 401 && isLoginUrlHttp) {
      // 构造一个标准的响应格式
      const mockResponse = {
        data: {
          code: 401,
          message: '用户名或密码错误'
        },
        status: 200, // 让组件认为请求成功了，但业务逻辑失败
        config: error.config
      }
      return Promise.resolve(mockResponse)
    }

    // 其他接口的 401 错误，表示 token 过期
    if (status === 401 && !isTokenExpiredHandling) {
      isTokenExpiredHandling = true
      removeToken()

      tokenTips({
        title: '登录过期',
        msg: '登录已过期，您需要重新登录！',
        okText: '重新登录',
        type: 2
      })

      // 延迟重置标志
      setTimeout(() => {
        isTokenExpiredHandling = false
      }, 1000)

      return new Promise(() => { })
    }

    const msg = `${status || '请求失败'}：${httpData.error || CODE_MESSAGE[status] || '未知错误'}`
    Vue.prototype.$msg.error(msg)

    // 返回一个永远不会resolve的Promise，避免错误冒泡
    return new Promise(() => { })
  }
)

export const $http = axios
export const $qs = Qs
