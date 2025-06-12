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
    path: '/dns',
    // type = 0 表示顶级菜单
    type: 0,
    meta: {
      icon: 'aicon icon-wangluo',
      title: '权威DNS',
      isSub: true
    },
    redirect: '/dns/domain',
    children: [
      /* ============================
       *         服务分组
       *  ============================
       * */
      {
        path: 'serve',
        meta: {
          title: '服务分组',
          icon: 'el-icon-set-up',
          isSub: true
        },
        redirect: 'serve/group',
        children: [
          {
            path: 'group',
            meta: {
              title: '分组管理'
            }
          },
          {
            path: 'gather',
            meta: {
              title: '采集设置'
            }
          },
          {
            path: 'setting',
            meta: {
              title: '转发设置'
            }
          },
          {
            path: 'node',
            meta: {
              title: '节点列表',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'es',
            meta: {
              title: '节点监控',
              hiddenBreadcrumb: true
            }
          }
        ]
      },

      /* ============================
       *         全局线路
       *  ============================
       * */
      {
        path: 'line',
        meta: {
          title: '全局线路',
          icon: 'el-icon-document',
          isSub: true
        },
        redirect: 'line/basic',
        children: [
          {
            path: 'basic',
            meta: {
              title: '基础数据'
            }
          },
          {
            path: 'area',
            meta: {
              title: '区域设置'
            }
          },
          {
            path: 'list',
            meta: {
              title: '线路配置'
            }
          }
        ]
      },

      /* ============================
       *         IP段管理
       *  ============================
       * */
      {
        path: 'ips',
        meta: {
          title: 'IP段管理',
          icon: 'aicon icon-shenhe',
          isSub: true
        },
        redirect: 'ips/basic',
        children: [
          {
            path: 'wait',
            meta: {
              title: '未识别IP'
            }
          },
          {
            path: 'right',
            meta: {
              title: '已识别IP'
            }
          }
        ]
      },

      /* ============================
       *         产品管理
       *  ============================
       * */
      {
        path: 'plan',
        meta: {
          title: '产品管理',
          icon: 'el-icon-box',
          isSub: true
        },
        redirect: 'plan/list',
        children: [
          {
            path: 'list',
            meta: {
              title: '产品列表'
            }
          },
          {
            path: 'list/detail',
            meta: {
              title: '添加产品',
              hidden: true,
              backUrl: '/dns/plan/list'
            }
          },
          {
            path: 'attr',
            meta: {
              title: '产品参数'
            }
          },
          {
            path: 'sold',
            meta: {
              title: '已售产品',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'sold/list',
            children: [
              {
                path: 'list',
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
       *         域名解析
       *  ============================
       * */
      {
        path: 'domain',
        meta: {
          title: '域名解析',
          icon: 'aicon icon-wangluo',
          isSub: true
        },
        redirect: 'domain/list',
        children: [
          {
            path: 'list',
            meta: {
              title: '域名列表'
            }
          },

          {
            // DNS 域名设置
            path: 'list/admin',
            meta: {
              title: '域名管理',
              hidden: true,
              requiresFlag: true,
              hiddenBreadcrumb: true,
              backUrl: '../list'
            },
            redirect: 'list/admin/record',
            children: [
              {
                // DNS 记录管理
                path: 'record',
                name: 'DNSDomainRecord',
                meta: {
                  title: '记录管理',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                // DNS 域名设置
                path: 'setting',
                name: 'DNSDomainSet',
                meta: {
                  hidden: true,
                  title: '域名设置',
                  hiddenBreadcrumb: true
                }
              },
              {
                // DNS 套餐服务
                path: 'plan',
                name: 'DNSDomainMeal',
                meta: {
                  hidden: true,
                  title: '套餐服务',
                  hiddenBreadcrumb: true
                }
              },

              {
                // DNS 自定义线路
                path: 'line',
                meta: {
                  hidden: true,
                  title: '自定义线路',
                  hiddenBreadcrumb: true
                }
              },
              {
                // DNS 解析量统计
                path: 'qps',
                meta: {
                  hidden: true,
                  title: '解析量统计',
                  hiddenBreadcrumb: true
                }
              },

              {
                // DNS 来源地域
                path: 'orign',
                name: 'DNSDomainOrign',
                meta: {
                  hidden: true,
                  title: '来源地域',
                  hiddenBreadcrumb: true
                }
              },

              {
                // DNS 操作日志
                path: 'log-request',
                meta: {
                  hidden: true,
                  title: '操作日志',
                  hiddenBreadcrumb: true
                }
              },
              {
                // DNS 异常日志
                path: 'log-error',
                meta: {
                  hidden: true,
                  title: '异常日志',
                  hiddenBreadcrumb: true
                }
              }
            ]
          },

          {
            // DNS 批量管理 ===================================================================================================
            path: 'bulk',
            redirect: 'bulk/domainsCreate',
            meta: {
              title: '批量管理',
              hSub: true,
              hiddenBreadcrumb: true
            },
            children: [
              {
                // 添加域名
                path: 'domainsCreate',
                meta: {
                  title: '添加域名',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                // 取回域名
                path: 'domainsRetrieve',
                meta: {
                  title: '取回域名',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                // 添加记录
                path: 'recordCreate',
                meta: {
                  title: '添加记录',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                // 修改记录
                path: 'recordUpdate',
                meta: {
                  title: '修改记录',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                // 导入记录
                path: 'recordImport',
                meta: {
                  title: '导入记录',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                // 导出记录
                path: 'recordExport',
                meta: {
                  title: '导出记录',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                // 操作日志
                path: 'log',
                meta: {
                  title: '操作日志',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },

          {
            path: 'ptr',
            meta: {
              title: '反向解析'
            }
          },
          {
            path: 'ptr/record',
            name: 'PtrRecord',
            meta: {
              title: 'PTR 记录',
              hidden: true,
              breadcrumb: true,
              backUrl: '../ptr'
            }
          }
        ]
      },
      /* ============================
       *         子域管理
       *  ============================
       * */
      // {
      //   path: 'domainManage',
      //   meta: {
      //     title: '子域管理',
      //     icon: 'aicon icon-wangluo',
      //     isSub: true
      //   },
      //   redirect: 'domainManage/register',
      //   children: [
      //     {
      //       path: 'register',
      //       meta: {
      //         title: '域名注册'
      //       }
      //     },

      //     {
      //       // DNS域名设置
      //     }
      //   ]
      // },

      /* ============================
       *        调度管理
       *  ============================
       * */
      {
        path: 'a-monitor',
        meta: {
          title: '调度管理',
          icon: 'el-icon-monitor',
          isSub: true
        },
        redirect: 'a-monitor/task',
        children: [
          {
            path: 'gtm',
            meta: {
              title: '调度任务'
            }
          },
          {
            path: 'gtm/rule',
            name: 'gtmRule',
            meta: {
              title: '调度规则',
              hidden: true,
              backUrl: '../gtm'
            }
          }
        ]
      },

      /* ============================
       *        HTTPDNS
       *  ============================
       * */
      {
        path: 'httpdns',
        meta: {
          title: 'HTTPDNS',
          icon: 'el-icon-mobile',
          isSub: true
        },
        redirect: 'httpdns/overview',
        children: [
          {
            path: 'config',
            meta: {
              title: '基本设置'
            }
          },
          {
            path: 'domain',
            meta: {
              title: '域名查询'
            }
          },
          {
            path: 'configure',
            meta: {
              title: '开发配置'
            }
          }
        ]
      },

      /* ============================
       *        证书管理
       *  ============================
       * */
      {
        path: 'ssl',
        meta: {
          title: 'SSL证书',
          icon: 'el-icon-s-claim',
          isSub: true
        },
        redirect: 'ssl/order',
        children: [
          {
            path: 'order',
            meta: {
              title: '证书管理',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'order/paid',
            children: [
              {
                path: 'paid',
                meta: {
                  title: '付费证书',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'free',
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
            meta: {
              title: '证书申请',
              hidden: true,
              backUrl: '../order'
            }
          },
          {
            path: 'plan',
            meta: {
              title: '证书套餐'
            }
          },
          {
            path: 'info',
            meta: {
              title: '信息管理',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'info/contact',
            children: [
              {
                path: 'contact',
                meta: {
                  title: '联系人',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'company',
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
       *         域名黑名单
       *  ============================
       * */
      {
        path: 'black',
        meta: {
          title: '域名黑名单',
          icon: 'el-icon-document',
          isSub: true
        },
        redirect: 'black/config',
        children: [
          {
            path: 'config',
            meta: {
              title: '拦截设置',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'config/domains',
            children: [
              {
                path: 'setting',
                meta: {
                  title: '黑名单设置',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'domains',
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
        path: 'analysis',
        meta: {
          title: '统计分析',
          icon: 'el-icon-document',
          isSub: true
        },
        redirect: 'analysis/node',
        children: [
          {
            path: 'node',
            meta: {
              title: '节点查询'
            }
          },
          {
            path: 'real-time-log',
            meta: {
              title: '请求查询'
            }
          },
          {
            path: 'query',
            meta: {
              title: '域名查询'
            }
          },

          {
            path: 'chart',
            meta: {
              title: '图表分析',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'chart/time',
            children: [
              {
                path: 'time',
                meta: {
                  title: '时段分析',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'orign',
                meta: {
                  title: '来源地域',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },
          {
            path: 'top',
            meta: {
              title: '请求排行'
            }
          }
        ]
      },

      /* ============================
       *         财务管理
       *  ============================
       * */
      {
        path: 'finance',
        meta: {
          title: '财务管理',
          icon: 'el-icon-bank-card',
          isSub: true
        },
        redirect: 'finance/order',
        children: [
          {
            path: 'order',
            meta: {
              title: '订单列表',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'order/list',
            children: [
              {
                path: 'list',
                meta: {
                  title: '订单列表',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'refunded',
                name: 'refunded',
                meta: {
                  title: '退款记录',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'refunding',
                name: 'refunding',
                meta: {
                  title: '待退款',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },
          {
            path: 'recharge',
            name: 'Recharge',
            meta: {
              title: '人工充值'
            }
          }
        ]
      },

      /* ============================
       *         操作记录
       *  ============================
       * */
      {
        path: 'log',
        meta: {
          title: '操作记录',
          icon: 'aicon icon-rizhi',
          isSub: true
        },
        redirect: 'log/users',
        children: [
          {
            path: 'users',
            meta: {
              title: '用户日志',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'users/list',
            children: [
              {
                path: 'list',
                meta: {
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },
          {
            path: 'admin',
            meta: {
              title: '管理日志',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'admin/list',
            children: [
              {
                path: 'list',
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
  }
]
