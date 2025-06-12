import Vue from 'vue'
import router, { resetRouter } from './default'
import store from '../store'
import { loadRoutes } from '../store/modules/permission'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken, removeToken, closeTips } from '@/utils/auth'
// API
import { getMenuNav } from '@/v2/cdn_admin/api/account/menu'

// NProgress Configuration
NProgress.configure({ showSpinner: true })

// no redirect whitelist
const whiteList = ['/login']

router.beforeEach((to, from, next) => {
  NProgress.start()
  // 优化，切换路由前中断前面所有请求，这里做取消动作
  if ((Vue.$httpRequestList || []).length > 0) {
    Vue.$httpRequestList.map(item => {
      item && item.f()
    })
    Vue.$httpRequestList = []
  }

  // 路由白名单
  if (whiteList.indexOf(to.path) !== -1) {
    closeTips()
  }

  // 设置标题
  if (to.meta.title) {
    document.title = to.meta.title + '-' + (window.title || '')
  }

  if (getToken()) {
    // TODO 登录页调用了 resetRouter ，重新登录时会重复几次登录页到登录的跳转，原因未知
    if (to.path === '/login' && from.path === '/login') return

    if (to.path === '/login') {
      // 目前在 login 页面没有主动清除token的。
      // 清除token：1. 用户主动退出；2.请求API时token失效。
      // 若在 login 存在 token，有可能在其他窗口登录了账号，可尝试进入控制台同步登录
      next('/console')
      return
    }

    // 如果没有拉取菜单
    if (!(store.state.permission.addRouters || []).length) {
      console.log('没有菜单，加载菜单', to, from)
      loadMenus(next, to)
      NProgress.done()
    } else {
      // console.log('有菜单', store.state.permission.addRouters)
      next()
    }
  } else {
    /* has no token */
    // 不需要验证 token 的页面
    // if (to.meta.noToken) {
    //   return next()
    // }

    if (to.path === '/login') {
      return next()
    }
    // 否则全部重定向到登录页
    next(`/login?redirect=${to.fullPath}`)
  }
})

// 获取菜单
export function loadMenus(next, to) {
  window.setLoading && window.setLoading(true)
  getMenuNav()
    .then(res => {
      const data = res.data || {}
      if (data.code !== 1 || !(data.menuList || []).length) {
        removeToken()
        return next('/login')
      }
      const sidebarRoutes = loadRoutes(data.menuList || [])
      store.dispatch('permission/GenerateRoutes', sidebarRoutes).then(() => {
        sidebarRoutes.forEach((item, idx) => {
          // 动态添加可访问路由表
          router.addRoute(item)
          // 添加控制台重定向路由
          if (idx == 0) {
            router.addRoute({
              path: '/console',
              redirect: item.path
            })
            router.addRoute({
              path: '/404',
              redirect: item.path
            })
          }
        })

        next({
          ...to,
          replace: true
        })
      })
    })
    .catch(err => {
      console.log(err)
      removeToken()
      next('/login')
    })
}

router.afterEach((to, from) => {
  // finish progress bar
  NProgress.done()
  // 关闭全局加载
  window.setLoading && window.setLoading(false)

  if (to.path == '/login') {
    store.dispatch('permission/GenerateRoutes', [])
    // router.addRoute({ name: 'home', path: '/home', children: [] })
    // 重置路由，(使用 addRoute 覆盖路由会发出警告)。建议将 vue-router升级至最新版 @3.6.5，版本过低 resetRouter 不生效
    resetRouter()
  }
})

export default router
