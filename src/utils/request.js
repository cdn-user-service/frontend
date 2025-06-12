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

console.log('现在VUE_APP_USE_MOCK是什么：', process.env.VUE_APP_USE_MOCK)

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
const requestConfig = config => {
  // NProgress.start()

  // 这个是 优化，切断页面前中断前面所有请求 通过axios cancelToken 关键代码
  // removePending(config) // 由于以前写的接口有重复的，暂时不用这个功能
  config.cancelToken = new CancelToken(cancel => {
    Vue.$httpRequestList.push({
      u: config.url + '&' + config.method,
      f: cancel
    })
  })

  // 为请求头对象，添加token 验证的Authorization 字段
  config.headers.token = getToken()

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
  response => responseConfig(response),
  error => {
     // 只前端模式下处理请求错误
     if (process.env.VUE_APP_USE_MOCK === 'true') {
      console.log('只前端模式：拦截到请求错误，返回模拟成功响应')
      return Promise.resolve({
        status: 200,
        data: {
          code: 1,
          data: {},
          message: '只前端模式模拟响应'
        }
      })
    }

    if (axios.isCancel(error)) {
      // 为了终结promise链 就是实际请求 不会走到.catch(rej=>{});这样就不会触发错误提示之类了。
      return new Promise(() => {})
    }
    console.log(error)
    // console.log(error.response)
    // console.log(error.response.data)

    const status = error.response.status
    const data = error.response.data || {}
    Vue.prototype.$msg.error(
      `${status}${data.error || ''}-${CODE_MESSAGE[status]}`
    )

    // 返回 response 里的错误信息
    return Promise.reject(error)
  }
)

export const $http = axios
export const $qs = Qs
