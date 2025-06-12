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
    path: '/account',
    // type = 0 表示顶级菜单
    type: 0,
    meta: {
      icon: 'el-icon-user',
      title: '账户',
      isSub: true
    },
    redirect: '/account/users',
    children: [
      /* ============================
       *         账户管理
       *  ============================
       * */
      {
        path: 'users',
        meta: {
          title: '账户管理',
          icon: 'el-icon-user',
          isSub: true
        },
        redirect: 'users/users',
        children: [
          {
            path: 'users',
            meta: {
              title: '用户列表'
            }
          },
          {
            path: 'admins',
            meta: {
              title: '管理列表'
            }
          },
          {
            path: 'reset-password',
            meta: {
              title: '修改密码'
            }
          }
        ]
      },

      /* ============================
       *         权限管理
       *  ============================
       * */
      {
        path: 'power',
        meta: {
          title: '权限管理',
          icon: 'aicon icon-yanzhengma2',
          isSub: true
        },
        redirect: 'power/roles',
        children: [
          {
            path: 'roles',
            meta: {
              title: '角色列表'
            }
          },
          {
            path: 'menus',
            meta: {
              title: '菜单列表'
            }
          }
        ]
      },

      /* ============================
       *         消息管理
       *  ============================
       * */
      {
        path: 'message',
        meta: {
          title: '消息管理',
          icon: 'aicon icon-xinbaniconshangchuan-'
        }
      },
      {
        path: 'message/detail',
        meta: {
          title: '消息详情',
          icon: 'aicon icon-xinbaniconshangchuan-',
          backUrl: '../message',
          selectMenu: '/account/message'
        }
      }
    ]
  }
]
