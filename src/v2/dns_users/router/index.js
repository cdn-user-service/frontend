import Vue from 'vue'
import VueRouter from 'vue-router'
import dnsRoutes from './routes/dns'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken, setToken, removeToken, closeTips } from '@/utils/auth'
// import homeRoutes from './routes/home'
// API
import { loginByaccess } from '@/v2/dns_users/api/dns/account'
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

// 用户自定义的登录模块
const LoginRoutes =
  !debug && $mode[179]
    ? [
        {
          path: '/login-custom',
          component: () =>
            import(/* webpackChunkName: "Login" */ '@/v2/login2/index.vue'),
          redirect: '/login',
          children: [
            {
              path: '/login',
              component: () =>
                import(/* webpackChunkName: "Login" */ '@/v2/login2/login'),
              name: 'Login2'
            },
            {
              path: '/register',
              component: () =>
                import(/* webpackChunkName: "Login" */ '@/v2/login2/register'),
              name: 'Register2'
            },
            {
              path: '/register-binding',
              component: () =>
                import(
                  /* webpackChunkName: "Login" */ '@/v2/login2/register-binding'
                ),
              name: 'RegisterBinding2',
              meta: {
                noToken: true
              }
            },
            {
              path: '/forget',
              component: () =>
                import(/* webpackChunkName: "Login" */ '@/v2/login2/forget'),
              name: 'Forget2'
            }
          ]
        }
      ]
    : [
        {
          path: '/login.html',
          component: () =>
            import(/* webpackChunkName: "Login" */ '../views/login/index.vue'),
          redirect: '/login',
          children: [
            {
              path: '/login',
              component: () =>
                import(
                  /* webpackChunkName: "Login" */ '../views/login/login/index.vue'
                ),
              name: 'Login'
            },
            {
              path: '/register',
              component: () =>
                import(
                  /* webpackChunkName: "Login" */ '../views/login/register'
                ),
              name: 'Register'
            },
            {
              // 微信注册选择绑定现有账号，还是注册新账号
              path: '/register-binding',
              component: () =>
                import(
                  /* webpackChunkName: "Login" */ '../views/login/registerBinding'
                ),
              meta: {
                noToken: true
              }
            },
            {
              // 找回密码
              path: '/reset-password',
              component: () =>
                import(
                  /* webpackChunkName: "Login" */ '../views/login/resetPassword'
                ),
              name: 'ResetPassword',
              props: true
            }
          ]
        }
      ]

const routes = [
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
    component: () =>
      import(/* webpackChunkName: "Finance" */ '../views/payment'),
    redirect: '/payment/purchase',
    children: [
      {
        // 购买DNS套餐 & 增值业务
        path: 'purchase',
        name: 'Purchase',
        component: () =>
          import(/* webpackChunkName: "Finance" */ '../views/payment/purchase'),
        redirect: '/payment/purchase/plans/:type',
        children: [
          {
            path: 'plans/:type',
            component: () =>
              import(
                /* webpackChunkName: "Finance" */ '../views/payment/purchase/plans'
              ),
            name: 'PurchasePlans',
            props: true,
            meta: {
              bindMoile: true
            }
          },
          {
            path: 'vas',
            component: () =>
              import(
                /* webpackChunkName: "Finance" */ '../views/payment/purchase/vas'
              ),
            name: 'PurchaseVas',
            props: true,
            meta: {
              bindMoile: true
            }
          }
        ]
      },
      // 提交订单
      {
        path: 'order/:orderId',
        name: 'Order',
        component: () =>
          import(/* webpackChunkName: "Finance" */ '../views/payment/order')
      }
    ]
  },
  {
    // 支付宝支付页面
    path: '/alipay/:outTradeNo/:totalAmount/:body',
    component: () =>
      import(/* webpackChunkName: "Finance" */ '../views/payment/alipay'),
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

  /** 控制台路由
   * ------------------------------------------------------------------------------------------------------------------------
   */
  {
    path: '/console',
    redirect: '/dns/dashboard'
  },
  // ...homeRoutes,
  ...dnsRoutes,

  // 过滤空路由
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

// 路由白名单，且需要清空token的页面
const whiteList = [
  '/register',
  '/forget',
  '/reset-password',
  '/register-binding'
]

// 挂在路由导航守卫 暂未有token
router.beforeEach((to, from, next) => {
  NProgress.start()
  // 优化，切换路由前中断前面所有请求，这里做取消动作
  // console.log(Vue.$httpRequestList)
  if (Vue.$httpRequestList.length > 0) {
    Vue.$httpRequestList.map(item => {
      item && item.f()
    })
    Vue.$httpRequestList = []
  }

  // 如果为管理员直接跳转过来的，并且千万过的页面为管理端允许跳转的页面，不验证token,直接放行
  // if (to.meta.allowAdminAccess && to.query.token) {
  if (to.query.token) {
    // 获取token
    setToken(to.query.token)
    return next()
  }

  // 从CDN平台跳转过来的
  if (to.query.access_token) {
    doLoginByaccess(next, to.query.access_token)
    return
  }

  // 不需要验证 token 的页面
  // if (to.meta.noToken) {
  //   return next()
  // }

  if (whiteList.indexOf(to.path) !== -1) {
    // removeToken()
    closeTips()
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

// 如果是从CDN平台跳转过来的，需要先通过 access_token 进行登录验证
async function doLoginByaccess(next, accessToken) {
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
