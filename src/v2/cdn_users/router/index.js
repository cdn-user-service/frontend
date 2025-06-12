import Vue from 'vue'
import router from './default'
import store from '../store'
import { loadRoutes } from '../store/modules/permission'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken, setToken, removeToken, closeTips } from '@/utils/auth'
// 手动写的路由列表
import routes from './routes'
// API
import { loginByaccess } from '@/v2/cdn_users/api/cdn/account'

NProgress.configure({ showSpinner: true }) // NProgress Configuration

// 路由白名单，且需要清空token的页面
const whiteList = [
  '/register',
  '/forget',
  '/reset-password',
  '/register-binding'
]

// 开发模式：直接设置token，跳过登录
if (process.env.NODE_ENV === 'development') {
  setToken('dev_token_for_testing', 'dev_user')
}

// 挂在路由导航守卫 暂未有token
router.beforeEach((to, from, next) => {
  NProgress.start()

  // 只前端模式处理
  if (process.env.VUE_APP_USE_MOCK === 'true') {
    // 如果是登录页，直接重定向到首页
    if (to.path === '/login') {
      // 假设首页路径是 '/console'，根据您项目的实际情况可能需要调整
      return next('/console')
    }

    // 如果没有加载过菜单，先加载菜单
    if (!(store.state.permission.addRouters || []).length) {
      console.log('开发模式：没有菜单，加载菜单')
      loadMenus(next, to)
      NProgress.done()
      return
    }

    // 其他页面直接放行
    next()
    return
  }

  // 优化，切换路由前中断前面所有请求，这里做取消动作
  if (Vue.$httpRequestList.length > 0) {
    // Vue.$httpRequestList.map(item => {
    //   item && item.f()
    // })
    // Vue.$httpRequestList = []
  }

  if (to.meta.title) {
    document.title = to.meta.title + '-' + (window.title || '')
  }

  // 由于前台不需要判断权限，直接拉取所有的菜单
  if (!(store.state.permission.addRouters || []).length) {
    console.log('没有菜单，加载菜单')
    loadMenus(next, to)
    NProgress.done()
    return
  }

  // 如果为管理员直接跳转过来的，并且前往过来的页面为管理端允许跳转的页面，不验证token,直接放行
  if (to.meta.allowAdmin && to.query.token) {
    // 获取token
    setToken(to.query.token)
    return next()
  }

  // 从DNS平台跳转过来的
  if (to.query.access_token) {
    doLoginByaccess(next, to.query.access_token)
    return
  }

  // 开发模式下跳过登录验证
  if (process.env.NODE_ENV === 'development') {
    next()
    return
  }

  // 不需要验证 token 的页面
  // if (to.meta.noToken) {
  //   return next()
  // }

  if (whiteList.indexOf(to.path) !== -1) {
    closeTips()
    // removeToken()
    return next()
  }

  // 若没有 token ，强制跳转到登录页
  if (!getToken()) {
    if (to.path !== '/login') {
      return next(`/login?redirect=${to.fullPath}`)
    }
  } else {
    if (to.path === '/login') {
      return next('/console')
    }
  }

  next()
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
  // 关闭全局加载
  window.setLoading && window.setLoading(false)
})

// 加载菜单路由
export function loadMenus(next, to) {
  const sidebarRoutes = loadRoutes(routes)
  // 动态添加可访问路由
  store.dispatch('permission/GenerateRoutes', sidebarRoutes).then(() => {
    // 动态添加可访问路由表
    sidebarRoutes.forEach(item => {
      router.addRoute(item)
    })
    next(to)
  })
}

// 如果是从DNS平台跳转过来的，需要先通过 access_token 进行登录验证
async function doLoginByaccess(next, accessToken) {
  // 只前端模式下模拟成功
  if (process.env.VUE_APP_USE_MOCK === 'true') {
    setToken('dev_token_for_testing', 'dev_user')
    return next()
  }

  try {
    const { data: res } = await loginByaccess({
      access_token: accessToken
    })
    console.log('doLoginByaccess', res)
    if (res.code !== 1) {
      removeToken()
      return next('/login')
    }
    // 保存token
    setToken(res.token)
    next()
  } catch (err) {
    console.log(err)
    next('/login')
  }
}

export default router
