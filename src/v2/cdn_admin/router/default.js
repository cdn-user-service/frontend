import Vue from 'vue'
import VueRouter from 'vue-router'
import { Layout } from '@/components/layouts'
import { $mode, debug } from '@/utils/env'

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

export const defaultRoutes = [
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
    name: 'login',
    component:
      !debug && $mode[179]
        ? resolve => require(['@/v2/login2/admin'], resolve) // 用户自定义的登录模块
        : resolve => require(['../views/login'], resolve)
  },

  /* ============================
   *         过滤空路由
   *  ============================
   * */
  // {
  //   path: '*',
  //   component: resolve => require(['@/components/404.vue'], resolve)
  // },
  {
    path: '*',
    component: resolve => require(['@/components/empty.vue'], resolve)
  },

  // 只用于调试的页面，不展示给用户的
  {
    path: '/debug',
    name: 'debug',
    component: resolve => require(['../views/debug'], resolve),
    meta: {
      noToken: true
    }
  },
  /* ============================
   * 用于手动刷新页面，重定向到当前页面
   *  ============================
   * */
  {
    path: '/redirect',
    name: 'redirect',
    component: Layout,
    meta: {
      hidden: true
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: resolve => require(['@/components/redirect.vue'], resolve)
      }
    ]
  }
]

// 创建路由
export const createRouter = () => {
  return new VueRouter({
    mode: 'hash',
    // mode: 'history',
    // scrollBehavior: () => ({ y: 0 }),
    scrollBehavior: () => {
      history.pushState(null, null, document.URL)
    },
    routes: defaultRoutes
  })
}

const router = createRouter()

// 重置路由
export function resetRouter() {
  router.matcher = createRouter().matcher
}

export default router
