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

// 用户自定义的登录模块
const LoginRoutes =
  !debug && $mode[179]
    ? [
        {
          path: '/login.html',
          component: resolve => require(['@/v2/login2/index.vue'], resolve),
          redirect: '/login',
          children: [
            {
              path: '/login',
              component: resolve => require(['@/v2/login2/login'], resolve),
              name: 'Login2'
            },
            {
              path: '/register',
              component: resolve => require(['@/v2/login2/register'], resolve),
              name: 'Register2'
            },
            {
              path: '/register-binding',
              component: resolve =>
                require(['@/v2/login2/register-binding'], resolve),
              name: 'RegisterBinding2',
              meta: {
                noToken: true
              }
            },
            {
              path: '/forget',
              component: resolve => require(['@/v2/login2/forget'], resolve),
              name: 'Forget2'
            }
          ]
        }
      ]
    : [
        {
          path: '/login.html',
          component: resolve => require(['../views/login/login.vue'], resolve),
          redirect: '/login',
          children: [
            {
              path: '/login',
              component: resolve =>
                require(['../views/login/login/index.vue'], resolve),
              name: 'Login'
            }
          ]
        },
        {
          path: '/register.html',
          component: resolve => require(['../views/login'], resolve),
          redirect: '/register',
          children: [
            // {
            //   path: '/login',
            //   component: () => import(/* webpackChunkName: "Login" */ '../views/login/login/index.vue'),
            //   name: 'Login'
            // },
            {
              path: '/register',
              component: resolve =>
                require(['../views/login/register'], resolve),
              name: 'Register'
            },
            {
              // 微信注册选择绑定现有账号，还是注册新账号
              path: '/register-binding',
              component: resolve =>
                require(['../views/login/registerBinding'], resolve),
              meta: {
                noToken: true
              }
            },
            {
              // 找回密码
              path: '/reset-password',
              component: resolve =>
                require(['../views/login/resetPassword'], resolve),
              name: 'ResetPassword',
              props: true
            }
          ]
        }
      ]

export const defaultRoutes = [
  {
    path: '/',
    redirect: '/login'
  },
  /* ============================
   *         登录模块
   *  ============================
   * */
  ...LoginRoutes,
  /* ============================
   *         支付路由
   *  ============================
   * */
  {
    path: '/payment',
    name: 'Payment',
    component: resolve => require(['../views/payment'], resolve),
    redirect: '/payment/purchase',
    children: [
      // 选择套餐
      {
        path: 'purchase',
        name: 'Purchase',
        component: resolve => require(['../views/payment/purchase'], resolve),
        meta: {
          bindMobile: true
        }
      },
      // 选择增值业务
      {
        path: 'purchase/vas',
        name: 'PurchaseVas',
        component: resolve =>
          require(['../views/payment/purchase/vas'], resolve),
        meta: {
          bindMobile: true
        }
      },
      // 提交订单
      {
        path: 'order/:serialNumber',
        name: 'Order',
        component: resolve => require(['../views/payment/order'], resolve)
      }
    ]
  },
  {
    // 支付宝支付页面
    path: '/alipay/:outTradeNo/:totalAmount/:body',
    component: resolve => require(['../views/payment/alipay'], resolve),
    name: 'Alipay',
    props: true,
    beforeEnter: (to, from, next) => {
      // 阻止其他页面跳转到支付页面
      if (
        from.name !== 'Order' &&
        from.name !== 'Recharge' &&
        from.name !== 'Verification' &&
        from.path !== '/'
      ) {
        return next(false)
      }
      next()
    }
  },
  /* ============================
   *         控制台路由
   *  ============================
   * */
  {
    path: '/console',
    redirect: '/cdn/dashboard'
  },
  // 过滤空路由
  {
    path: '*',
    component: resolve => require(['@/components/404.vue'], resolve)
  },
  /* ============================
   *  用于手动刷新页面，重定向到当前页面
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
        component: resolve => require(['@/components/redirect.vue'], resolve)
      }
    ]
  }
]

export default new VueRouter({
  mode: 'hash',
  routes: defaultRoutes,
  scrollBehavior: () => {
    history.pushState(null, null, document.URL)
  }
})
