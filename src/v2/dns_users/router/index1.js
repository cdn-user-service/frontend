import Vue from 'vue'
import router from './default'
import store from '../store'
import { loadRoutes } from '../store/modules/permission'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
// 手动写的路由列表
import routes from './routes'
import { setToken, getToken, removeToken } from '@/utils/auth'

NProgress.configure({ showSpinner: true }) // NProgress Configuration

// 路由白名单，且需要清空token的页面
const whiteList = [
  '/login',
  '/register',
  '/forget',
  '/reset-password',
  '/register-binding'
]

// 挂在路由导航守卫 暂未有token
router.beforeEach((to, from, next) => {
  NProgress.start()
  // 优化，切换路由前中断前面所有请求，这里做取消动作
  if (Vue.$httpRequestList.length > 0) {
    // Vue.$httpRequestList.map(item => {
    //   item && item.f()
    // })
    // Vue.$httpRequestList = []
  }

  if (to.meta.title) {
    document.title = to.meta.title + '-' + window.title
  }

  // 由于前台不需要判断权限，直接拉取所有的菜单
  if (!(store.state.permission.addRouters || []).length) {
    console.log('没有菜单，加载菜单')
    loadMenus(next, to)
    NProgress.done()
  }

  // 如果为管理员直接跳转过来的，并且千万过的页面为管理端允许跳转的页面，不验证token,直接放行
  if (to.meta.allowAdmin && to.query.token) {
    // 获取token
    setToken(to.query.token)
    return next()
  }

  // 不需要验证 token 的页面
  if (to.meta.noToken) {
    return next()
  }

  if (whiteList.indexOf(to.path) !== -1) {
    removeToken()
    return next()
  }

  // 若没有 token ，强制跳转到登录页
  if (!getToken()) {
    if (to.path !== '/login') {
      return next(`/login?redirect=${to.fullPath}`)
    }
  }

  next()
})

// finish progress bar
router.afterEach(() => {
  NProgress.done()
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

export default router
