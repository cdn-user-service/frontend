
import { Layout } from '@/components/layouts'
export default [
  /* ============================
   * 用于手动刷新页面，重定向到当前页面
   *  ============================
   * */
  {
    path: '/redirect',
    component: Layout,
    meta: {
      hidden: true
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/components/redirect.vue')
      }
    ]
  },

  /* ============================
   *         总览
   *  ============================
   * */
  {
    path: '/home',
    name: 'Dashboard',
    component: Layout,
    meta: {
      title: '首页',
      levelHidden: true
    },
    redirect: '/home/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () =>
          import(
            /* webpackChunkName: "Home_Dashboard" */ '../../views/home/dashboard'
          ),
        meta: {
          title: '服务概览',
          icon: 'aicon icon-shouye',
          hiddenBreadcrumb: true
        }
      },
      {
        path: 'auth',
        component: () =>
          import(
            /* webpackChunkName: "Home_Dashboard" */ '../../views/home/auth'
          ),
        meta: {
          title: '系统授权',
          icon: 'aicon icon-shouquan1',
          hiddenBreadcrumb: true
        }
      }
    ]
  }
]
