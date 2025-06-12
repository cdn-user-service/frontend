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
 * allowAdminAccess: false, // 允许管理员访问
 * bindMobile: false, // 是否需要显示未绑定手机号提示框
 * custom: string, 定制的页面，值为页面标志字符串：rewrite = URL转发
 * isMenu: false 是否可作为菜单，用于控制菜单动态显示隐藏
 */

import { Layout } from '@/components/layouts'
export default [
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
        component: () => import('@/components/redirect.vue')
      }
    ]
  },

  /* ============================
   *         服务概览
   *  ============================
   * */
  {
    path: '/dns',
    name: 'Dashboard',
    component: Layout,
    meta: {
      title: '服务概览',
      icon: 'el-icon-s-marketing',
      levelHidden: true
    },
    redirect: '/dns/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () =>
          import(
            /* webpackChunkName: "Dashboard" */ '../../views/dns/dashboard'
          ),
        meta: {
          title: '服务概览',
          icon: 'el-icon-s-marketing',
          allowAdminAccess: true,
          breadcrumb: true
        }
      }
    ]
  },

  /* ============================
   *         域名解析
   *  ============================
   * */
  {
    path: '/dns/domain',
    component: Layout,
    meta: {
      title: '域名解析',
      icon: 'aicon icon-wangluo'
    },
    redirect: '/dns/domain/list',
    children: [
      {
        path: 'list',
        component: () =>
          import(/* webpackChunkName: "Domain" */ '../../views/dns/domain'),
        redirect: 'list/list',
        meta: {
          title: '我的域名',
          allowAdminAccess: true
        },
        children: [
          {
            path: 'list',
            name: 'DomainList',
            component: () =>
              import(
                /* webpackChunkName: "Domain" */ '../../views/dns/domain/list'
              ),
            meta: {
              hidden: true,
              bindMoile: true,
              allowAdminAccess: true,
              hiddenBreadcrumb: true
            },
            beforeEnter: (to, from, next) => {
              // 设置是否需要使用保存下来的分页数据
              to.meta.flag = from.meta.requiresFlag || false
              next()
            }
          },
          {
            path: 'group',
            component: () =>
              import(
                /* webpackChunkName: "Domain" */ '../../views/dns/domain/group'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          }
        ]
      },

      {
        // DNS 域名设置
        path: 'list/admin',
        component: () =>
          import(
            /* webpackChunkName: "DNS_Record" */ '@/v2/dns_common/views/domain-admin'
          ),
        name: 'DNSDomainMgt',
        meta: {
          hidden: true,
          requiresFlag: true,
          hiddenBreadcrumb: true
        },
        redirect: 'list/admin/:domain/:id/:userId/record',
        children: [
          {
            // DNS 记录管理
            path: ':domain/:id/:userId/record',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Record" */ '@/v2/dns_common/views/domain-admin/record'
              ),
            name: 'DNSDomainRecord',
            meta: {
              hidden: true,
              requiresFlag: true,
              hiddenBreadcrumb: true
            },
            prop: true
          },
          {
            // DNS 域名设置
            path: ':domain/:id/:userId/setting',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Record" */ '@/v2/dns_common/views/domain-admin/setting'
              ),
            name: 'DNSDomainSet',
            meta: {
              hidden: true,
              requiresFlag: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // DNS 套餐服务
            path: ':domain/:id/:userId/plan',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Record" */ '@/v2/dns_common/views/domain-admin/plan'
              ),
            name: 'DNSDomainMeal',
            meta: {
              hidden: true,
              requiresFlag: true,
              hiddenBreadcrumb: true
            }
          },

          {
            // DNS 自定义线路
            path: ':domain/:id/:userId/line',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Record" */ '@/v2/dns_common/views/domain-admin/line'
              ),
            name: 'DNSDomainLine',
            meta: {
              hidden: true,
              requiresFlag: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // DNS 解析量统计
            path: ':domain/:id/:userId/qps',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Monitor" */ '@/v2/dns_common/views/domain-admin/qps'
              ),
            name: 'DNSDomainQps',
            meta: {
              hidden: true,
              requiresFlag: true,
              hiddenBreadcrumb: true
            }
          },

          {
            // DNS 来源地域
            path: ':domain/:id/:userId/orign',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Monitor" */ '@/v2/dns_common/views/domain-admin/orign'
              ),
            name: 'DNSDomainOrign',
            meta: {
              hidden: true,
              requiresFlag: true,
              hiddenBreadcrumb: true
            }
          },

          {
            // DNS 操作日志
            path: ':domain/:id/:userId/log-request',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Record" */ '@/v2/dns_common/views/domain-admin/log-request'
              ),
            name: 'DNSDomainLogRequest',
            meta: {
              hidden: true,
              requiresFlag: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // DNS 异常日志
            path: ':domain/:id/:userId/log-error',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Record" */ '@/v2/dns_common/views/domain-admin/log-error'
              ),
            name: 'DNSDomainLogError',
            meta: {
              hidden: true,
              requiresFlag: true,
              hiddenBreadcrumb: true
            }
          }
        ]
      },

      {
        // DNS 批量管理 ===================================================================================================
        path: 'bulk',
        component: () =>
          import(
            /* webpackChunkName: "DNS_Batch" */ '@/v2/dns_common/views/domain-bulk'
          ),
        redirect: 'bulk/domainsCreate',
        meta: {
          title: '批量管理',
          hiddenBreadcrumb: true
        },
        children: [
          {
            // 添加域名
            path: 'domainsCreate',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Batch" */ '@/v2/dns_common/views/domain-bulk/domainsCreate'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 取回域名
            path: 'domainsRetrieve',
            component: () =>
              import(
                /* webpackChunkName: "DNS_batch" */ '@/v2/dns_common/views/domain-bulk/domainsRetrieve'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 修改套餐
            path: 'planUpdate',
            component: () =>
              import(
                /* webpackChunkName: "DNS_batch" */ '@/v2/dns_common/views/domain-bulk/planUpdate'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 添加记录
            path: 'recordCreate',
            component: () =>
              import(
                /* webpackChunkName: "DNS_batch" */ '@/v2/dns_common/views/domain-bulk/recordCreate'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 修改记录
            path: 'recordUpdate',
            component: () =>
              import(
                /* webpackChunkName: "DNS_batch" */ '@/v2/dns_common/views/domain-bulk/recordUpdate'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 导入记录
            path: 'recordImport',
            component: () =>
              import(
                /* webpackChunkName: "DNS_batch" */ '@/v2/dns_common/views/domain-bulk/recordImport'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 导出记录
            path: 'recordExport',
            component: () =>
              import(
                /* webpackChunkName: "DNS_batch" */ '@/v2/dns_common/views/domain-bulk/recordExport'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 操作日志
            path: 'log',
            component: () =>
              import(
                /* webpackChunkName: "DNS_batch" */ '@/v2/dns_common/views/domain-bulk/log'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          }
        ]
      },

      {
        path: 'ptr',
        component: () =>
          import(/* webpackChunkName: "Domain" */ '@/v2/dns_common/views/ptr'),
        meta: {
          title: '反向解析',
          breadcrumb: true
        }
      },
      {
        path: 'ptr/record',
        component: () =>
          import(
            /* webpackChunkName: "Domain" */ '@/v2/dns_common/views/ptr/record'
          ),
        name: 'PtrRecord',
        meta: {
          title: 'PTR 记录',
          hidden: true,
          breadcrumb: true,
          backUrl: '/dns/domain/ptr',
          breadcrumbBackPath: '/dns/domain/ptr'
        }
      },
      {
        path: 'access-token',
        meta: {
          title: 'CDN服务',
          custom: 'access-token'
        },
        component: () =>
          import(
            /* webpackChunkName: "Domain" */ '../../views/dns/domain/access-token'
          )
      }

      // {
      //   path: 'qps',
      //   component: () =>
      //     import(/* webpackChunkName: "Monitor" */ '@/v2/dns_common/views/qps'),
      //   meta: {
      //     title: '流量监控',
      //     breadcrumb: true
      //   }
      // }
    ]
  },

  /* ============================
   *        调度管理
   *  ============================
   * */
  {
    path: '/dns/a-monitor',
    component: Layout,
    meta: {
      title: '调度管理',
      icon: 'el-icon-monitor',
      custom: 'a-monitor'
    },
    redirect: '/dns/a-monitor/task',
    children: [
      // {
      //   path: 'task',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Amonitor" */
      //       '@/v2/dns_common/views/a-monitor/task'
      //     ),
      //   meta: {
      //     title: '调度任务',
      //     breadcrumb: true
      //   }
      // },
      {
        path: 'gtm',
        component: () =>
          import(
            /* webpackChunkName: "Amonitor" */
            '@/v2/dns_common/views/a-monitor/gtm'
          ),
        meta: {
          title: '调度任务',
          breadcrumb: true,
          custom: 'gtm'
        }
      },
      {
        path: 'gtm/rule',
        name: 'gtmRule',
        component: () =>
          import(
            /* webpackChunkName: "Amonitor" */
            '@/v2/dns_common/views/a-monitor/gtm/rule'
          ),
        meta: {
          title: '调度规则',
          hidden: true,
          breadcrumb: true,
          backUrl: '/dns/a-monitor/gtm',
          breadcrumbBackPath: '/dns/a-monitor/gtm'
        }
      },
      // {
      //   path: 'real-time',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Amonitor" */
      //       '@/v2/dns_common/views/a-monitor/real-time'
      //     ),
      //   meta: {
      //     title: '实时监控',
      //     breadcrumb: false
      //   }
      // },
      // {
      //   path: 'real-time/detail',
      //   name: 'RealTimeDetail',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Amonitor" */
      //       '@/v2/dns_common/views/a-monitor/real-time/detail'
      //     ),
      //   meta: {
      //     title: '实时监控详情',
      //     breadcrumb: false,
      //     hidden: true,
      //     hiddenBreadcrumb: true
      //   }
      // }

      // A 监控
      {
        path: 'monitors',
        component: () =>
          import(
            /* webpackChunkName: "Amonitor" */
            '@/v2/dns_common/views/a-monitor/monitors'
          ),
        redirect: 'monitors/settings',
        meta: {
          title: 'A 监控',
          hiddenBreadcrumb: true,
          custom: 'monitors'
        },
        children: [
          {
            path: 'ontime',
            component: () =>
              import(
                /* webpackChunkName: "Amonitor" */
                '@/v2/dns_common/views/a-monitor/monitors/ontime'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'settings',
            component: () =>
              import(
                /* webpackChunkName: "Amonitor" */
                '@/v2/dns_common/views/a-monitor/monitors/settings'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'counts',
            component: () =>
              import(
                /* webpackChunkName: "Amonitor" */
                '@/v2/dns_common/views/a-monitor/monitors/counts'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'details',
            component: () =>
              import(
                /* webpackChunkName: "Amonitor" */
                '@/v2/dns_common/views/a-monitor/monitors/details'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'custom-lines',
            component: () =>
              import(
                /* webpackChunkName: "Amonitor" */
                '@/v2/dns_common/views/a-monitor/monitors/custom-lines'
              ),
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          }
        ]
      }
    ]
  },

  /* ============================
   *        HTTPDNS
   *  ============================
   * */
  {
    path: '/dns/httpdns',
    component: Layout,
    meta: {
      title: 'HTTPDNS',
      icon: 'el-icon-mobile'
    },
    redirect: '/dns/httpdns/overview',
    children: [
      // {
      //   path: 'overview',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "HTTPDNS" */
      //       '@/v2/dns_common/views/httpdns/overview'
      //     ),
      //   meta: {
      //     title: '业务概览',
      //     breadcrumb: true
      //   }
      // },
      {
        path: 'domain',
        component: () =>
          import(
            /* webpackChunkName: "HTTPDNS" */
            '@/v2/dns_common/views/httpdns/domain'
          ),
        meta: {
          title: '域名查询',
          breadcrumb: true
        }
      },
      {
        path: 'domain/detail',
        name: 'HttpdnsDomainDetail',
        component: () =>
          import(
            /* webpackChunkName: "HTTPDNS" */
            '@/v2/dns_common/views/httpdns/domain/detail'
          ),
        meta: {
          title: '解析量详情',
          breadcrumb: true,
          backUrl: '/dns/httpdns/domain',
          breadcrumbBackPath: '/dns/httpdns/domain',
          hidden: true
        }
      },
      {
        path: 'configure',
        component: () =>
          import(
            /* webpackChunkName: "HTTPDNS" */
            '@/v2/dns_common/views/httpdns/configure'
          ),
        meta: {
          title: '开发配置',
          breadcrumb: true
        }
      }
      // {
      //   path: 'experience',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "HTTPDNS" */
      //       '@/v2/dns_common/views/httpdns/experience'
      //     ),
      //   meta: {
      //     title: '在线体验',
      //     breadcrumb: true
      //   }
      // }
    ]
  },

  /* ============================
   *         SSL证书
   *  ============================
   * */
  {
    path: '/dns/ssl',
    component: Layout,
    meta: {
      title: 'SSL证书',
      icon: 'el-icon-s-claim'
    },
    redirect: '/dns/ssl/order',
    children: [
      {
        path: 'order',
        meta: {
          title: '证书管理'
        },
        component: () =>
          import(
            /* webpackChunkName: "Ssl" */ '@/v2/dns_common/views/ssl/order'
          ),
        redirect: 'order/paid',
        children: [
          {
            path: 'paid',
            component: () =>
              import(
                /* webpackChunkName: "Ssl" */ '@/v2/dns_common/views/ssl/order/paid'
              ),
            meta: {
              title: '付费证书',
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'free',
            component: () =>
              import(
                /* webpackChunkName: "Ssl" */ '@/v2/dns_common/views/ssl/order/free'
              ),
            meta: {
              title: '免费证书',
              hidden: true,
              hiddenBreadcrumb: true
            }
          }
        ]
      },
      {
        path: 'order/apply',
        name: 'sslOrderApply',
        component: () =>
          import(
            /* webpackChunkName: "SSL" */
            '@/v2/dns_common/views/ssl/order/apply'
          ),
        meta: {
          title: '证书申请',
          hidden: true,
          breadcrumb: true,
          backUrl: '/dns/ssl/order',
          breadcrumbBackPath: '/dns/ssl/order'
        }
      },
      // {
      //   path: 'buy-bulk',
      //   component: () => import(/* webpackChunkName: "Ssl" */ '../../views/dns/ssl/buy-bulk'),
      //   meta: {
      //     title: '批量购买',
      //     hidden: true
      //   }
      // },
      {
        path: 'info',
        component: () =>
          import(
            /* webpackChunkName: "SSL" */
            '@/v2/dns_common/views/ssl/info'
          ),
        meta: {
          title: '信息管理',
          breadcrumb: true
        },
        redirect: 'info/contact',
        children: [
          {
            path: 'contact',
            component: () =>
              import(
                /* webpackChunkName: "SSL" */
                '@/v2/dns_common/views/ssl/info/contact'
              ),
            meta: {
              title: '联系人',
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'company',
            component: () =>
              import(
                /* webpackChunkName: "SSL" */
                '@/v2/dns_common/views/ssl/info/company'
              ),
            meta: {
              title: '公司',
              hidden: true,
              hiddenBreadcrumb: true
            }
          }
        ]
      },
      {
        path: 'goods',
        component: () =>
          import(
            /* webpackChunkName: "Ssl" */ '@/v2/dns_common/views/ssl/goods'
          ),
        meta: {
          title: '证书超市',
          breadcrumb: true
        }
      }
    ]
  },

  /* ============================
   *         统计分析
   *  ============================
   * */
  {
    path: '/dns/analysis',
    component: Layout,
    meta: {
      title: '统计分析',
      icon: 'el-icon-document'
    },
    redirect: '/dns/analysis/query',
    children: [
      {
        path: 'query',
        component: () =>
          import(
            /* webpackChunkName: "Recursion" */ '@/v2/dns_common/views/analysis/query'
          ),
        meta: {
          title: '域名查询',
          breadcrumb: true
        }
      },
      // {
      //   path: 'chart',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Recursion" */ '@/v2/dns_common/views/analysis/chart'
      //     ),
      //   meta: {
      //     title: '图表分析',
      //     hiddenBreadcrumb: true
      //   },
      //   redirect: 'chart/time',
      //   children: [
      //     {
      //       path: 'time',
      //       component: () =>
      //         import(
      //           /* webpackChunkName: "Recursion" */ '@/v2/dns_common/views/analysis/chart/time'
      //         ),
      //       meta: {
      //         title: '时段分析',
      //         hiddenBreadcrumb: true
      //       }
      //     },
      //     {
      //       path: 'orign',
      //       component: () =>
      //         import(
      //           /* webpackChunkName: "Recursion" */ '@/v2/dns_common/views/analysis/chart/orign'
      //         ),
      //       meta: {
      //         title: '来源地域',
      //         hiddenBreadcrumb: true
      //       }
      //     }
      //   ]
      // },
      {
        path: 'top',
        component: () =>
          import(
            /* webpackChunkName: "Recursion" */ '@/v2/dns_common/views/analysis/top'
          ),
        meta: {
          title: '请求排行',
          breadcrumb: true
        }
      }
    ]
  },

  /* ============================
   *         套餐管理
   *  ============================
   * */
  {
    path: '/dns/plan',
    name: 'Plan',
    component: Layout,
    meta: {
      title: 'DNS解析套餐',
      icon: 'el-icon-box'
    },
    redirect: '/dns/plan/own',
    children: [
      {
        // 我的套餐
        path: 'own',
        component: () =>
          import(/* webpackChunkName: "Plan" */ '../../views/dns/plan/own'),
        redirect: 'own/1',
        meta: {
          title: '我的套餐',
          hiddenBreadcrumb: true
        },
        children: [
          {
            // 使用中
            path: '1',
            component: () =>
              import(
                /* webpackChunkName: "Plan" */ '../../views/dns/plan/own/list.vue'
              ),
            meta: {
              mode: '1',
              hidden: true,
              bindMoile: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 未使用
            path: '2',
            component: () =>
              import(
                /* webpackChunkName: "Plan" */ '../../views/dns/plan/own/list.vue'
              ),
            meta: {
              mode: '2',
              hidden: true,
              bindMoile: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 已过期
            path: '3',
            component: () =>
              import(
                /* webpackChunkName: "Plan" */ '../../views/dns/plan/own/list.vue'
              ),
            meta: {
              mode: '3',
              hidden: true,
              bindMoile: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 已失效
            path: '4',
            component: () =>
              import(
                /* webpackChunkName: "Plan" */ '../../views/dns/plan/own/list.vue'
              ),
            meta: {
              mode: '4',
              hidden: true,
              bindMoile: true,
              hiddenBreadcrumb: true
            }
          }
        ]
      },
      {
        // 购买套餐
        path: 'purchase',
        component: () =>
          import(
            /* webpackChunkName: "Plan" */ '../../views/dns/plan/purchase'
          ),
        meta: {
          title: '购买套餐',
          breadcrumb: true,
          bindMoile: true
        }
      },
      {
        // DNS 增值业务
        path: 'vas',
        component: () =>
          import(/* webpackChunkName: "Plan" */ '../../views/dns/plan/vas'),
        meta: {
          title: '增值业务',
          breadcrumb: true,
          bindMoile: true
        }
      }
    ]
  },

  /* ============================
   *         财务管理
   *  ============================
   * */
  {
    path: '/dns/finance',
    name: 'Finance',
    component: Layout,
    meta: {
      title: '财务中心',
      icon: 'el-icon-bank-card'
    },
    redirect: '/dns/finance/order',
    children: [
      {
        path: 'order',
        component: () =>
          import(
            /* webpackChunkName: "Finance" */ '@/v2/dns_common/views/finance'
          ),
        redirect: 'order/paid',
        meta: {
          title: '我的订单',
          hiddenBreadcrumb: true
        },
        children: [
          {
            path: 'refunded',
            name: 'refunded',
            component: () =>
              import(
                /* webpackChunkName: "Finance" */ '@/v2/dns_common/views/finance/refund.vue'
              ),
            meta: {
              title: '退款记录',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'refunding',
            name: 'refunding',
            component: () =>
              import(
                /* webpackChunkName: "Finance" */ '@/v2/dns_common/views/finance/refund.vue'
              ),
            meta: {
              title: '待退款',
              hiddenBreadcrumb: true
            }
          },
          {
            path: ':path',
            component: () =>
              import(
                /* webpackChunkName: "Finance" */ '@/v2/dns_common/views/finance/order.vue'
              ),
            meta: {
              title: '我的订单',
              hiddenBreadcrumb: true
            }
          }

          // { // 支付成功
          //     path: '14',
          //     component: () => import(/* webpackChunkName: "Finance" */ '../../views/dns/finance/order/list.vue'),
          //     meta: {
          //         goodsType: '10,11,12,13', // 产品类型
          //         status: 14 // 支付状态
          //     }
          // },
          // { // 待支付
          //     path: '10',
          //     component: () => import(/* webpackChunkName: "Finance" */ '../../views/dns/finance/order/list.vue'),
          //     meta: {
          //         goodsType: '10,11,12,13', // 产品类型
          //         status: 10 // 支付状态
          //     }
          // },
          // { // 退款记录
          //     path: '24',
          //     component: () => import(/* webpackChunkName: "Finance" */ '../../views/dns/finance/order/list.vue'),
          //     meta: {
          //         goodsType: '10,11,12,13', // 产品类型
          //         status: 24 // 支付状态
          //     }
          // },
          // { // 充值记录
          //     path: '1',
          //     component: () => import(/* webpackChunkName: "Finance" */ '../../views/dns/finance/order/list.vue'),
          //     meta: {
          //         goodsType: '1', // 产品类型
          //         status: 14 // 支付状态
          //     }
          // }
        ]
      },
      {
        path: 'recharge',
        component: () =>
          import(
            /* webpackChunkName: "Finance" */ '../../views/dns/finance/recharge'
          ),
        name: 'Recharge',
        meta: {
          title: '余额充值',
          breadcrumb: true
        }
      }
    ]
  },

  /* ============================
   *         账户管理
   *  ============================
   * */
  {
    path: '/dns/account',
    name: 'Account',
    component: Layout,
    meta: {
      title: '个人中心',
      icon: 'el-icon-user'
    },
    redirect: '/dns/account/info',
    children: [
      {
        // DNS 账号信息
        path: 'info',
        component: () =>
          import(
            /* webpackChunkName: "Message_Log_user" */ '../../views/dns/account/info'
          ),
        meta: {
          title: '账号信息',
          breadcrumb: true,
          allowAdminAccess: true,
          bindMobile: true,
          isMenu: true
        }
      },
      {
        // 实名认证
        path: 'verification',
        name: 'Verification',
        component: () =>
          import(
            /* webpackChunkName: "Message_Log_user" */ '../../views/dns/account/verification'
          ),
        meta: {
          title: '实名认证',
          breadcrumb: true,
          // 定制的页面, verify 表示 实名认证
          custom: 'verify'
        }
      },
      {
        path: 'apikey',
        component: () =>
          import(
            /* webpackChunkName: "Message_Log_user" */ '../../views/dns/account/apikey'
          ),
        meta: {
          title: 'API 密钥',
          breadcrumb: true
        }
      },
      {
        path: 'domainLicense',
        component: () =>
          import(
            /* webpackChunkName: "Message_Log_user" */ '../../views/dns/account/domainLicense'
          ),
        meta: {
          title: '域名授权',
          hiddenBreadcrumb: true
        },
        redirect: 'domainLicense/receive',
        children: [
          {
            path: 'receive',
            name: 'receive',
            component: () =>
              import(
                /* webpackChunkName: "Finance" */ '../../views/dns/account/domainLicense/receive'
              ),
            meta: {
              title: '接收域名授权',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'initiate',
            name: 'initiate',
            component: () =>
              import(
                /* webpackChunkName: "Finance" */ '../../views/dns/account/domainLicense/initiate'
              ),
            meta: {
              title: '发起域名授权',
              hiddenBreadcrumb: true
            }
          }
        ]
      }
    ]
  },

  /* ============================
   *         消息管理
   *  ============================
   * */
  {
    path: '/dns/message',
    name: 'Message',
    component: Layout,
    meta: {
      title: '消息管理',
      icon: 'aicon icon-xinbaniconshangchuan-',
      badge: true,
      levelHidden: true
    },
    redirect: '/dns/message/list',
    children: [
      {
        path: 'list',
        component: () =>
          import(
            /* webpackChunkName: "Message_Log_user" */ '../../views/dns/message/index.vue'
          ),
        beforeEnter: (to, from, next) => {
          // 设置是否需要使用保存下来的分页数据
          to.meta.flag = from.meta.requiresFlag || false
          next()
        },
        meta: {
          title: '消息管理',
          badge: true,
          icon: 'aicon icon-xinbaniconshangchuan-',
          breadcrumb: true
        }
      },
      {
        path: 'detail',
        component: () =>
          import(
            /* webpackChunkName: "Message_Log_user" */ '../../views/dns/message/detail.vue'
          ),
        name: 'MessageDetail',
        props: true,
        meta: {
          title: '消息详情',
          requiresFlag: true,
          hidden: true,
          breadcrumb: true,
          backUrl: './list',
          breadcrumbBackPath: './list'
        }
      }
    ]
  },

  /* ============================
   *         日志服务
   *  ============================
   * */
  {
    path: '/dns/log',
    name: 'Log',
    component: Layout,
    meta: {
      title: '日志服务',
      levelHidden: true
    },
    children: [
      {
        path: 'list',
        component: () =>
          import(
            /* webpackChunkName: "Message_Log_user" */ '../../views/dns/log'
          ),
        redirect: 'list/0',
        meta: {
          title: '日志服务',
          icon: 'aicon icon-rizhi',
          hiddenBreadcrumb: true
        },
        children: [
          {
            path: ':method',
            component: () =>
              import(
                /* webpackChunkName: "Message_Log_user" */ '../../views/dns/log/list.vue'
              ),
            name: 'AppAccountController',
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          }
        ]
      }
    ]
  }
]
