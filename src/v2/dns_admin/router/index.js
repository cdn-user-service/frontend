import Vue from 'vue'
import VueRouter from 'vue-router'
import topRoutes from './top-routes'
import homeRoutes from './routes/home'
import dnsRoutes from './routes/dns'
import accountRoutes from './routes/account'
import systemRoutes from './routes/system'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken, removeToken, closeTips } from '@/utils/auth'
import { $mode, debug } from '@/utils/env'

NProgress.configure({ showSpinner: true }) // NProgress Configuration

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

// replace
const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function push(location, onResolve, onReject) {
  return originalReplace.call(this, location).catch(err => err)
}

Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  /* ============================
   *         登录模块
   *  ============================
   * */
  {
    path: '/login',
    component:
      !debug && $mode[179]
        ? () => import(/* webpackChunkName: "Login" */ '@/v2/login2/admin') // 用户自定义的登录模块
        : () => import(/* webpackChunkName: "Login" */ '../views/login')
  },

  /* ============================
   *         控制台路由
   *  ============================
   * */
  {
    path: '/console',
    redirect: '/home/dashboard'
  },
  ...topRoutes,
  ...homeRoutes,
  ...dnsRoutes,
  ...accountRoutes,
  ...systemRoutes,

  /* ============================
   *         过滤空路由
   *  ============================
   * */
  {
    path: '*',
    component: () =>
      import(/* webpackChunkName: "Page404" */ '@/components/404.vue')
  }
]

const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

// no redirect whitelist
const whiteList = ['/login']

// 挂在路由导航守卫 暂未有token
router.beforeEach((to, from, next) => {
  NProgress.start()
  // 优化，切换路由前中断前面所有请求，这里做取消动作
  if (Vue.$httpRequestList.length > 0) {
    Vue.$httpRequestList.map(item => {
      // 查询当前系统版本的接口不做取消
      //   if (item.u == 'sys/version/GetUpdateStatus&get' || item.u == 'sys/version/GetVersionData&get') return
      item && item.f()
    })
    Vue.$httpRequestList = []
  }

  // 不需要验证 token 的页面
  // if (to.meta.noToken) {
  //   return next()
  // }

  // 路由白名单
  if (whiteList.indexOf(to.path) !== -1) {
    closeTips()
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

export default router
