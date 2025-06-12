/**
 * requiresFlag, // 保存分页数据
 * hidden: true, 隐藏不显示
 * title: '我的域名', // 名称
 * icon: '', // 图标
 * dot: true, // 小圆点
 * badge: string // 标签，数字或字符串
 * levelHidden: true, // 独立的el-menu-item
 * breadcrumb: true, // 页头面包屑
 * backUrl: string, // 页头面包屑带返回路径
 * custom: string, 定制的页面，值为页面标志字符串：rewrite = URL转发
 */

import { Layout } from '@/components/layouts'

export default [
  /* ============================
   *         服务分组
   *  ============================
   * */
  {
    path: '/dns/serve',
    component: Layout,
    meta: {
      title: '服务分组',
      icon: 'el-icon-set-up'
    },
    redirect: '/dns/serve/group',
    children: [
      {
        path: 'group',
        component: () =>
          import(
            /* webpackChunkName: "Serve_Group" */
            '../../views/dns/serve/group'
          ),
        meta: {
          title: '分组管理',
          breadcrumb: true
        }
      },
      {
        path: 'gather',
        component: () =>
          import(
            /* webpackChunkName: "Serve_Group" */
            '../../views/dns/serve/gather'
          ),
        meta: {
          title: '采集设置',
          breadcrumb: true
        }
      },
      {
        path: 'setting',
        component: () =>
          import(
            /* webpackChunkName: "Serve_Group" */
            '../../views/dns/serve/setting'
          ),
        meta: {
          title: '转发设置',
          breadcrumb: true
        }
      },

      {
        path: 'node',
        component: () =>
          import(
            /* webpackChunkName: "Serve_Group" */
            '../../views/dns/serve/node'
          ),
        meta: {
          title: '节点列表',
          hiddenBreadcrumb: true
        }
      },
      {
        path: 'list/:id',
        component: () =>
          import(
            /* webpackChunkName: "DNS_Product" */
            '../../views/dns/serve/node/update.vue'
          ),
        name: 'NodeUpdate',
        props: true,
        meta: {
          title: '添加编辑节点',
          hidden: true,
          breadcrumb: true,
          backUrl: '/dns/serve/node'
        },
        beforeEnter: (to, from, next) => {
          to.meta.title = to.params.id === 'add' ? '添加节点' : '编辑节点'
          next()
        }
      },
      {
        path: 'es',
        component: () =>
          import(
            /* webpackChunkName: "Serve_Group" */
            '../../views/dns/serve/es'
          ),
        meta: {
          title: '节点监控',
          hiddenBreadcrumb: true
        }
      }
      // {
      //   path: 'monitor',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Serve_Group" */
      //       '../../views/dns/serve/monitor'
      //     ),
      //   meta: {
      //     title: '节点监控'
      //   },
      //   redirect: 'monitor/nodeload',
      //   children: [
      //     // {
      //     //     path: 'flow',
      //     //     name: 'Flow',
      //     //     component: () => import(/* webpackChunkName: "DNS_Monitor" */ '../views/monitor/chart.vue'),
      //     //     meta: {
      //     //         isGetHostList: true,
      //     //         hidden: true
      //     //     }
      //     // },
      //     {
      //       path: 'nodeload',
      //       name: 'Nodeload',
      //       component: () =>
      //         import(
      //           /* webpackChunkName: "DNS_Monitor" */
      //           '../../views/dns/serve/monitor/chart.vue'
      //         ),
      //       meta: {
      //         isGetHostList: true,
      //         hidden: true
      //       }
      //     },
      //     {
      //       path: 'cpu',
      //       name: 'Cpu',
      //       component: () =>
      //         import(
      //           /* webpackChunkName: "DNS_Monitor" */
      //           '../../views/dns/serve/monitor/chart.vue'
      //         ),
      //       meta: {
      //         isGetHostList: true,
      //         hidden: true
      //       }
      //     },
      //     {
      //       path: 'memory',
      //       name: 'Memory',
      //       component: () =>
      //         import(
      //           /* webpackChunkName: "DNS_Monitor" */
      //           '../../views/dns/serve/monitor/chart.vue'
      //         ),
      //       meta: {
      //         isGetHostList: true,
      //         hidden: true
      //       }
      //     },
      //     {
      //       path: 'disk',
      //       name: 'Disk',
      //       component: () =>
      //         import(
      //           /* webpackChunkName: "DNS_Monitor" */
      //           '../../views/dns/serve/monitor/chart.vue'
      //         ),
      //       meta: {
      //         isGetHostList: true,
      //         hidden: true
      //       }
      //     },
      //     {
      //       path: 'diskio',
      //       name: 'Diskio',
      //       component: () =>
      //         import(
      //           /* webpackChunkName: "DNS_Monitor" */
      //           '../../views/dns/serve/monitor/chart.vue'
      //         ),
      //       meta: {
      //         isGetHostList: true,
      //         hidden: true
      //       }
      //     },
      //     {
      //       path: 'networkio',
      //       name: 'Networkio',
      //       component: () =>
      //         import(
      //           /* webpackChunkName: "DNS_Monitor" */
      //           '../../views/dns/serve/monitor/chart.vue'
      //         ),
      //       meta: {
      //         isGetHostList: true,
      //         hidden: true
      //       }
      //     }
      //   ]
      // }
      // {
      //   path: 'term',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Serve_Group" */
      //       '../../views/dns/serve/term'
      //     ),
      //   meta: {
      //     title: '终端',
      //     breadcrumb: false
      //   }
      // }
    ]
  },

  /* ============================
   *         全局线路
   *  ============================
   * */
  {
    path: '/dns/line',
    component: Layout,
    meta: {
      title: '全局线路',
      icon: 'el-icon-document'
    },
    redirect: '/dns/line/basic',
    children: [
      {
        path: 'basic',
        component: () =>
          import(
            /* webpackChunkName: "Line_Global" */
            '../../views/dns/line/basic'
          ),
        meta: {
          title: '基础数据',
          breadcrumb: true
        }
      },
      {
        path: 'area',
        component: () =>
          import(
            /* webpackChunkName: "Line_Global" */
            '../../views/dns/line/area'
          ),
        meta: {
          title: '区域设置',
          breadcrumb: true
        }
      },
      {
        path: 'list',
        component: () =>
          import(
            /* webpackChunkName: "Line_Global" */
            '../../views/dns/line/list'
          ),
        meta: {
          title: '线路配置',
          breadcrumb: true
        }
      }
    ]
  },

  /* ============================
   *         IP段管理
   *  ============================
   * */
  {
    path: '/dns/ips',
    component: Layout,
    meta: {
      title: 'IP段管理',
      icon: 'aicon icon-shenhe'
    },
    redirect: '/dns/ips/basic',
    children: [
      // {
      //   path: 'basic',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Line_Global" */
      //       '../../views/dns/ips/basic'
      //     ),
      //   meta: {
      //     title: 'IP地址库',
      //     breadcrumb: true
      //   }
      // },
      {
        path: 'wait',
        component: () =>
          import(
            /* webpackChunkName: "Line_Global" */
            '../../views/dns/ips/wait'
          ),
        meta: {
          title: '未识别IP',
          breadcrumb: true
        }
      },
      {
        path: 'right',
        component: () =>
          import(
            /* webpackChunkName: "Line_Global" */
            '../../views/dns/ips/right'
          ),
        meta: {
          title: '已识别IP',
          breadcrumb: true
        }
      }
    ]
  },

  /* ============================
   *         产品管理
   *  ============================
   * */
  {
    path: '/dns/plan',
    component: Layout,
    meta: {
      title: '产品管理',
      icon: 'el-icon-box'
    },
    redirect: '/dns/plan/list',
    children: [
      {
        path: 'list',
        component: () =>
          import(
            /* webpackChunkName: "DNS_Plan" */
            '../../views/dns/plan/list'
          ),
        meta: {
          title: '产品列表',
          breadcrumb: true
        }
      },
      {
        path: 'list/:id',
        component: () =>
          import(
            /* webpackChunkName: "DNS_Plan" */
            '../../views/dns/plan/list/update.vue'
          ),
        name: 'ProductEdit',
        props: true,
        meta: {
          title: '添加产品',
          hidden: true,
          breadcrumb: true,
          backUrl: '/dns/plan/list'
        },
        beforeEnter: (to, from, next) => {
          to.meta.title = to.params.id === 'add' ? '添加产品' : '编辑产品'
          next()
        }
      },
      {
        path: 'attr',
        component: () =>
          import(
            /* webpackChunkName: "DNS_Plan" */
            '../../views/dns/plan/attr'
          ),
        meta: {
          title: '产品参数',
          breadcrumb: true
        }
      },
      {
        path: 'sold',
        component: () =>
          import(
            /* webpackChunkName: "DNS_Plan" */
            '../../views/dns/plan/sold'
          ),
        meta: {
          title: '已售产品',
          hiddenBreadcrumb: true
        },
        redirect: 'sold/1',
        children: [
          {
            // 使用中
            path: '1',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Plan" */
                '../../views/dns/plan/sold/list.vue'
              ),
            meta: {
              mode: '1',
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 未使用
            path: '2',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Plan" */
                '../../views/dns/plan/sold/list.vue'
              ),
            meta: {
              mode: '2',
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 已过期
            path: '3',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Plan" */
                '../../views/dns/plan/sold/list.vue'
              ),
            meta: {
              mode: '3',
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // 已失效
            path: '4',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Plan" */
                '../../views/dns/plan/sold/list.vue'
              ),
            meta: {
              mode: '4',
              hidden: true,
              hiddenBreadcrumb: true
            }
          }
        ]
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
          import(
            /* webpackChunkName: "Domain" */
            '../../views/dns/domain/list'
          ),
        meta: {
          title: '域名列表',
          breadcrumb: true
        },
        beforeEnter: (to, from, next) => {
          // 设置是否需要使用保存下来的分页数据
          to.meta.flag = from.meta.requiresFlag || false
          next()
        }
      },

      {
        // DNS 域名设置
        path: 'list/admin',
        component: () =>
          import(
            /* webpackChunkName: "DNS_Record" */
            '@/v2/dns_common/views/domain-admin'
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
                /* webpackChunkName: "DNS_Record" */
                '@/v2/dns_common/views/domain-admin/record'
              ),
            name: 'DNSDomainRecord',
            meta: {
              hidden: true,
              requiresFlag: true,
              hiddenBreadcrumb: true
            }
          },
          {
            // DNS 域名设置
            path: ':domain/:id/:userId/setting',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Record" */
                '@/v2/dns_common/views/domain-admin/setting'
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
                /* webpackChunkName: "DNS_Record" */
                '@/v2/dns_common/views/domain-admin/plan'
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
                /* webpackChunkName: "DNS_Record" */
                '@/v2/dns_common/views/domain-admin/line'
              ),
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
                /* webpackChunkName: "DNS_Monitor" */
                '@/v2/dns_common/views/domain-admin/qps'
              ),
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
                /* webpackChunkName: "DNS_Record" */
                '@/v2/dns_common/views/domain-admin/log-request'
              ),
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
                /* webpackChunkName: "DNS_Record" */
                '@/v2/dns_common/views/domain-admin/log-error'
              ),
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
            /* webpackChunkName: "DNS_Batch" */
            '@/v2/dns_common/views/domain-bulk'
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
                /* webpackChunkName: "DNS_Batch" */
                '@/v2/dns_common/views/domain-bulk/domainsCreate'
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
                /* webpackChunkName: "DNS_batch" */
                '@/v2/dns_common/views/domain-bulk/domainsRetrieve'
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
                /* webpackChunkName: "DNS_batch" */
                '@/v2/dns_common/views/domain-bulk/recordCreate'
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
                /* webpackChunkName: "DNS_batch" */
                '@/v2/dns_common/views/domain-bulk/recordUpdate'
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
                /* webpackChunkName: "DNS_batch" */
                '@/v2/dns_common/views/domain-bulk/recordImport'
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
                /* webpackChunkName: "DNS_batch" */
                '@/v2/dns_common/views/domain-bulk/recordExport'
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
                /* webpackChunkName: "DNS_batch" */
                '@/v2/dns_common/views/domain-bulk/log'
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
          import(
            /* webpackChunkName: "Domain" */
            '@/v2/dns_common/views/ptr'
          ),
        meta: {
          title: '反向解析',
          breadcrumb: true
        }
      },
      {
        path: 'ptr/record',
        component: () =>
          import(
            /* webpackChunkName: "Domain" */
            '@/v2/dns_common/views/ptr/record'
          ),
        name: 'PtrRecord',
        meta: {
          title: 'PTR 记录',
          hidden: true,
          breadcrumb: true,
          backUrl: '/dns/domain/ptr'
        }
      }

      // {
      //   path: 'qps',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Monitor" */
      //       '@/v2/dns_common/views/qps'
      //     ),
      //   meta: {
      //     title: '流量监控',
      //     breadcrumb: true
      //   }
      // },

      // {
      //   path: 'dnssec',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Domain" */
      //       '@/v2/dns_common/views/dnssec'
      //     ),
      //   meta: {
      //     title: 'DNSSEC',
      //     breadcrumb: true
      //   }
      // }
    ]
  },
  /* ============================
   *         域名管理
   *  ============================
   * */
  // {
  //   path: '/dns/domainManage',
  //   component: Layout,
  //   meta: {
  //     title: '子域管理',
  //     icon: 'aicon icon-wangluo'
  //   },
  //   redirect: '/dns/domainManage/register',
  //   children: [
  //     {
  //       path: 'register',
  //       component: () =>
  //         import(
  //           /* webpackChunkName: "Domain" */
  //           '../../views/dns/domainManage/register'
  //         ),
  //       meta: {
  //         title: '域名注册',
  //         breadcrumb: true
  //       }
  //     },
  //     {
  //       path: 'list',
  //       component: () =>
  //         import(
  //           /* webpackChunkName: "Domain" */
  //           '../../views/dns/domainManage/list'
  //         ),
  //       meta: {
  //         title: '域名授权',
  //         breadcrumb: true
  //       }
  //     }
  //   ]
  // },

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
      //   path: 'node',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Amonitor" */
      //       '@/v2/dns_common/views/a-monitor/node'
      //     ),
      //   meta: {
      //     title: '节点监控',
      //     breadcrumb: true
      //   }
      // },
      // {
      //   path: 'task',
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "Amonitor" */
      //       '@/v2/dns_common/views/a-monitor/task'
      //     ),
      //   meta: {
      //     title: '监控任务',
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
          backUrl: '/dns/a-monitor/gtm'
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
      // },

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
        path: 'config',
        component: () =>
          import(
            /* webpackChunkName: "HTTPDNS" */
            '@/v2/dns_common/views/httpdns/config'
          ),
        meta: {
          title: '基本设置',
          breadcrumb: true
        }
      },
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
   *        证书管理
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
        component: () =>
          import(
            /* webpackChunkName: "SSL" */
            '@/v2/dns_common/views/ssl/order'
          ),
        meta: {
          title: '证书管理'
        },
        redirect: 'order/paid',
        children: [
          {
            path: 'paid',
            component: () =>
              import(
                /* webpackChunkName: "SSL" */
                '@/v2/dns_common/views/ssl/order/paid'
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
                /* webpackChunkName: "SSL" */
                '@/v2/dns_common/views/ssl/order/free'
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
          backUrl: '/dns/ssl/order'
        }
      },
      {
        path: 'plan',
        component: () =>
          import(
            /* webpackChunkName: "SSL" */
            '@/v2/dns_common/views/ssl/plan'
          ),
        meta: {
          title: '证书套餐',
          breadcrumb: true
        }
      },
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
      }
    ]
  },

  /* ============================
   *         递归设置
   *  ============================
   * */
  {
    path: '/dns/recursion',
    component: Layout,
    meta: {
      title: '递归设置',
      icon: 'el-icon-document'
      // custom: 'recursion'
    },
    redirect: '/dns/recursion/config',
    children: [
      {
        path: 'config',
        component: () =>
          import(
            /* webpackChunkName: "Recursion" */
            '../../views/dns/recursion/config'
          ),
        meta: {
          title: '递归设置',
          breadcrumb: true
        }
      },
      {
        path: 'upstream-domain',
        component: () =>
          import(
            /* webpackChunkName: "Recursion" */
            '../../views/dns/recursion/upstream-domain'
          ),
        meta: {
          title: '域名转发',
          breadcrumb: true
        }
      },
      {
        path: 'upstream-line',
        component: () =>
          import(
            /* webpackChunkName: "Recursion" */
            '../../views/dns/recursion/upstream-line'
          ),
        meta: {
          title: '线路转发',
          breadcrumb: true
        }
      }
    ]
  },

  /* ============================
   *         域名黑名单
   *  ============================
   * */
  {
    path: '/dns/black',
    component: Layout,
    meta: {
      title: '域名黑名单',
      icon: 'el-icon-document'
    },
    redirect: '/dns/black/config',
    children: [
      {
        path: 'config',
        component: () =>
          import(
            /* webpackChunkName: "Recursion" */
            '../../views/dns/black/config'
          ),
        meta: {
          title: '拦截设置'
        },
        redirect: 'config/domains',
        children: [
          {
            path: 'setting',
            component: () =>
              import(
                /* webpackChunkName: "Recursion" */
                '../../views/dns/black/config/setting'
              ),
            meta: {
              title: '黑名单设置',
              hidden: true,
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'domains',
            component: () =>
              import(
                /* webpackChunkName: "Recursion" */
                '../../views/dns/black/config/domains'
              ),
            meta: {
              title: '黑名单域名',
              hidden: true,
              hiddenBreadcrumb: true
            }
          }
        ]
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
    redirect: '/dns/analysis/node',
    children: [
      {
        path: 'node',
        component: () =>
          import(
            /* webpackChunkName: "Recursion" */
            '@/v2/dns_common/views/analysis/node'
          ),
        meta: {
          title: '节点查询',
          breadcrumb: true
        }
      },
      {
        path: 'real-time-log',
        component: () =>
          import(
            /* webpackChunkName: "Recursion" */
            '@/v2/dns_common/views/analysis/real-time-log'
          ),
        meta: {
          title: '请求查询',
          breadcrumb: true
        }
      },
      {
        path: 'query',
        component: () =>
          import(
            /* webpackChunkName: "Recursion" */
            '@/v2/dns_common/views/analysis/query'
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
      //       /* webpackChunkName: "Recursion" */
      //       '@/v2/dns_common/views/analysis/chart'
      //     ),
      //   meta: {
      //     title: '图表分析'
      //   },
      //   redirect: 'chart/time',
      //   children: [
      //     {
      //       path: 'time',
      //       component: () =>
      //         import(
      //           /* webpackChunkName: "Recursion" */
      //           '@/v2/dns_common/views/analysis/chart/time'
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
      //           /* webpackChunkName: "Recursion" */
      //           '@/v2/dns_common/views/analysis/chart/orign'
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
            /* webpackChunkName: "Recursion" */
            '@/v2/dns_common/views/analysis/top'
          ),
        meta: {
          title: '请求排行',
          breadcrumb: true
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
    component: Layout,
    meta: {
      title: '财务管理',
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
        meta: {
          title: '订单列表'
        },
        redirect: 'order/paid',
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
              title: '订单列表',
              hiddenBreadcrumb: true
            }
          }

          // {
          //   // 支付成功
          //   path: '14',
          //   component: () =>
          //     import(
          //       /* webpackChunkName: "Finance" */
          //       '../../views/dns/finance/order/list.vue'
          //     ),
          //   meta: {
          //     hidden: true,
          //     goodsType: '10,11,12,13', // 产品类型
          //     status: 14 // 支付状态
          //   }
          // },
          // {
          //   // 待支付
          //   path: '10',
          //   component: () =>
          //     import(
          //       /* webpackChunkName: "Finance" */
          //       '../../views/dns/finance/order/list.vue'
          //     ),
          //   meta: {
          //     hidden: true,
          //     goodsType: '10,11,12,13', // 产品类型
          //     status: 10 // 支付状态
          //   }
          // },
          // {
          //   // 待退款
          //   path: '15',
          //   component: () =>
          //     import(
          //       /* webpackChunkName: "Finance" */
          //       '../../views/dns/finance/order/list.vue'
          //     ),
          //   meta: {
          //     hidden: true,
          //     goodsType: '10,11,12,13', // 产品类型
          //     status: 15 // 支付状态
          //   }
          // },
          // {
          //   // 退款记录
          //   path: '24',
          //   component: () =>
          //     import(
          //       /* webpackChunkName: "Finance" */
          //       '../../views/dns/finance/order/list.vue'
          //     ),
          //   meta: {
          //     hidden: true,
          //     goodsType: '10,11,12', // 产品类型
          //     status: 24 // 支付状态
          //   }
          // },
          // {
          //   // 充值记录
          //   path: '1',
          //   component: () =>
          //     import(
          //       /* webpackChunkName: "Finance" */
          //       '../../views/dns/finance/order/list.vue'
          //     ),
          //   meta: {
          //     hidden: true,
          //     goodsType: '1', // 产品类型
          //     status: 14 // 支付状态
          //   }
          // }
        ]
      },
      {
        path: 'recharge',
        component: () =>
          import(
            /* webpackChunkName: "Finance" */
            '../../views/dns/finance/recharge'
          ),
        name: 'Recharge',
        meta: {
          title: '人工充值',
          breadcrumb: true
        }
      }
    ]
  },

  /* ============================
   *         操作记录
   *  ============================
   * */
  {
    path: '/dns/log',
    component: Layout,
    meta: {
      title: '操作记录',
      icon: 'aicon icon-rizhi'
    },
    redirect: '/dns/log/users',
    children: [
      {
        path: 'users',
        component: () =>
          import(
            /* webpackChunkName: "DNS_Log" */
            '../../views/dns/log/users'
          ),
        meta: {
          title: '用户日志'
        },
        redirect: 'users/0',
        children: [
          {
            path: ':method',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Log" */
                '../../views/dns/log/users/list.vue'
              ),
            name: 'UsersLogList',
            meta: {
              hidden: true,
              hiddenBreadcrumb: true
            }
          }
        ]
      },
      {
        path: 'admin',
        component: () =>
          import(
            /* webpackChunkName: "DNS_Log" */
            '../../views/dns/log/admin/index.vue'
          ),
        meta: {
          title: '管理日志'
        },
        redirect: 'admin/0',
        children: [
          {
            path: ':method',
            component: () =>
              import(
                /* webpackChunkName: "DNS_Log" */
                '../../views/dns/log/admin/list.vue'
              ),
            name: 'ManagerLogLogin',
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
