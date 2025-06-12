/**
 * redirect: '', // 重定向路径 | string
 * title: '', // 菜单标题 | string
 * icon: '', // 菜单图标 | string
 * isSub: false, // 是否为sub菜单 | bool
 * hSub: false, // 是否为水平的菜单 | bool
 * hidden: false, // 隐藏菜单 | bool
 * hiddenBreadcrumb: false, // 隐藏面包屑 | bool
 * noToken: false, // 不需要验证token | bool
 * allowAdmin: false, // 允许管理员访问 | bool
 * backUrl: '', // 返回上一页的url | string
 * selectMenu: '', // 选中的菜单 | string
 * badge: '', // 在图标右上角展示数字 | string
 * custom: '', // 定制的页面，值为页面标志字符串：rewrite = URL转发【string】

 * bindMobile: false, // 是否需要显示未绑定手机号提示框

  // 下面的保留
  cache: false, // 是否开启缓存 | bool
  affix: false, // 是否固定在标签页上 | bool,
  dot: false // 小圆点 | bool
 */

export default [
  {
    path: '/home',
    // type = 0 表示顶级菜单
    type: 0,
    meta: {
      icon: 'aicon icon-shouye',
      title: '首页',
      isSub: true
    },
    redirect: '/home/dashboard',
    children: [
      {
        path: 'dashboard',
        meta: {
          title: '服务概览',
          icon: 'aicon icon-shouye',
          hiddenBreadcrumb: true
        }
      },
      {
        path: 'auth',
        meta: {
          title: '系统授权',
          icon: 'aicon icon-shouquan1',
          hiddenBreadcrumb: true
        }
      }
    ]
  }
]
