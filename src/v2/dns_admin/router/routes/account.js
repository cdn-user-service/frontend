/**
 * requiresFlag, // 保存分页数据
 * hidden: true, 隐藏不显示
 * title: '我的域名', // 名称
 * icon: '', // 图标
 * dot: true, // 小圆点
 * badge: string // 标签，数字或字符串
 * levelHidden: true, // 独立的el-menu-item
 * breadcrumb: true, // 页头面包屑
 * breadcrumbBackPath: string, // 页头面包屑带返回路径
 * custom: string, 定制的页面，值为页面标志字符串：rewrite = URL转发
 */

import { Layout } from '@/components/layouts'

export default [
  /* ============================
   *         账户管理
   *  ============================
   * */
  {
    path: '/account/users',
    component: Layout,
    meta: {
      title: '账户管理',
      icon: 'el-icon-user'
    },
    redirect: '/account/users/users',
    children: [
      {
        path: 'users',
        component: () =>
          import(
            /* webpackChunkName: "Account" */ '../../views/account/users/users'
          ),
        meta: {
          title: '用户列表'
        }
      },
      {
        path: 'admins',
        component: () =>
          import(
            /* webpackChunkName: "Account" */ '../../views/account/users/admins'
          ),
        meta: {
          title: '管理列表'
        }
      },
      {
        path: 'reset-password',
        component: () =>
          import(
            /* webpackChunkName: "Account" */ '../../views/account/users/reset-password'
          ),
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
    path: '/account/power',
    name: 'PowerManager',
    component: Layout,
    meta: {
      title: '权限管理',
      icon: 'aicon icon-yanzhengma2'
    },
    redirect: '/account/power/roles',
    children: [
      {
        path: 'roles',
        component: () =>
          import(
            /* webpackChunkName: "Account" */ '../../views/account/power/roles'
          ),
        meta: {
          title: '角色列表'
        }
      },
      {
        path: 'menus',
        component: () =>
          import(
            /* webpackChunkName: "Account" */ '../../views/account/power/menus'
          ),
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
    path: '/account/message',
    component: Layout,
    meta: {
      title: '消息管理',
      icon: 'aicon icon-xinbaniconshangchuan-',
      levelHidden: true
    },
    redirect: '/account/message/list',
    children: [
      {
        path: 'list',
        component: () =>
          import(
            /* webpackChunkName: "Account" */ '../../views/account/message/index.vue'
          ),
        meta: {
          icon: 'aicon icon-xinbaniconshangchuan-',
          title: '消息管理'
        }
      }
    ]
  }
]
