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
    name: 'dns',
    // type = 0 表示顶级菜单
    type: 0,
    meta: {
      icon: 'el-icon-s-marketing',
      title: '权威DNS',
      isSub: true
    },
    redirect: '/dns/dashboard',
    children: [
      /* ============================
       *         服务概览
       *  ============================
       * */
      {
        path: 'dashboard',
        meta: {
          title: '服务概览',
          icon: 'el-icon-s-marketing',
          allowAdmin: true,
          bindMobile: true,
          hiddenBreadcrumb: true
        }
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
            redirect: 'list/list',
            meta: {
              title: '我的域名',
              allowAdmin: true,
              hSub: true,
              hiddenBreadcrumb: true
            },
            children: [
              {
                path: 'list',
                name: 'DomainList',
                meta: {
                  hidden: true,
                  bindMoile: true,
                  allowAdmin: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'group',
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
            name: 'DNSDomainMgt',
            meta: {
              hidden: true,
              hiddenBreadcrumb: true,
              hSub: true,
              backUrl: '../list'
            },
            redirect: 'list/admin/record',
            children: [
              {
                path: 'record',
                name: 'DNSDomainRecord',
                meta: {
                  title: '记录管理',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'setting',
                name: 'DNSDomainSet',
                meta: {
                  title: '域名设置',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'plan',
                name: 'DNSDomainMeal',
                meta: {
                  title: '套餐服务',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },

              {
                path: 'line',
                name: 'DNSDomainLine',
                meta: {
                  title: '自定义线路',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'qps',
                name: 'DNSDomainQps',
                meta: {
                  title: '解析量统计',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },

              {
                path: 'orign',
                name: 'DNSDomainOrign',
                meta: {
                  title: '来源地域',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },

              {
                path: 'log-request',
                name: 'DNSDomainLogRequest',
                meta: {
                  title: '操作日志',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'log-error',
                name: 'DNSDomainLogError',
                meta: {
                  title: '异常日志',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },

          {
            path: 'bulk',
            redirect: 'bulk/domainsCreate',
            meta: {
              title: '批量管理',
              hiddenBreadcrumb: true,
              hSub: true
            },
            children: [
              {
                path: 'domainsCreate',
                meta: {
                  title: '添加域名',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'domainsRetrieve',
                meta: {
                  title: '取回域名',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'recordCreate',
                meta: {
                  title: '添加记录',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'recordUpdate',
                meta: {
                  title: '修改记录',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'recordImport',
                meta: {
                  title: '导入记录',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'recordExport',
                meta: {
                  title: '导出记录',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
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
              backUrl: '../ptr'
            }
          }
        ]
      },

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
          },
          {
            path: 'real-time/detail',
            name: 'RealTimeDetail',
            meta: {
              title: '实时监控详情',
              hidden: true,
              hiddenBreadcrumb: true
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
            path: 'domain',
            meta: {
              title: '域名查询'
            }
          },
          {
            path: 'domain/detail',
            name: 'HttpdnsDomainDetail',
            meta: {
              title: '解析量详情',
              backUrl: '../domain',
              hidden: true
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
       *         SSL证书
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
            path: 'info',
            meta: {
              title: '信息管理',
              breadcrumb: true,
              hSub: true
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
          },
          {
            path: 'goods',
            meta: {
              title: '商业证书'
            }
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
        redirect: 'analysis/query',
        children: [
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
              hiddenBreadcrumb: true,
              hSub: true
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
       *         套餐管理
       *  ============================
       * */
      {
        path: 'plan',
        name: 'Plan',
        meta: {
          title: '套餐管理',
          icon: 'el-icon-box',
          isSub: true
        },
        redirect: 'plan/own',
        children: [
          {
            // 我的套餐
            path: 'own',
            redirect: 'own/list',
            meta: {
              title: '我的套餐',
              hiddenBreadcrumb: true,
              hSub: true
            },
            children: [
              {
                path: 'list',
                meta: {
                  mode: '1',
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
            meta: {
              title: '购买套餐',
              bindMoile: true
            }
          },
          {
            // DNS 增值业务
            path: 'vas',
            meta: {
              title: '增值业务',
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
        path: 'finance',
        name: 'Finance',
        meta: {
          title: '财务中心',
          icon: 'el-icon-bank-card',
          isSub: true
        },
        redirect: 'finance/order',
        children: [
          {
            path: 'order',
            redirect: 'order/paid',
            meta: {
              title: '我的订单',
              hiddenBreadcrumb: true,
              hSub: true
            },
            children: [
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
                  hidden: true,
                  title: '待退款',
                  hiddenBreadcrumb: true
                }
              },
              {
                path: ':path',
                meta: {
                  title: '我的订单',
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
              title: '余额充值'
            }
          }
        ]
      },

      /* ============================
       *         账户管理
       *  ============================
       * */
      {
        path: 'account',
        name: 'Account',
        meta: {
          title: '个人中心',
          icon: 'el-icon-user',
          isSub: true
        },
        redirect: 'account/info',
        children: [
          {
            // DNS 账号信息
            path: 'info',
            meta: {
              title: '账号信息',
              allowAdmin: true,
              bindMobile: true
            }
          },
          {
            // 实名认证
            path: 'verification',
            name: 'Verification',
            meta: {
              title: '实名认证',
              // 定制的页面, verify 表示 实名认证
              custom: 'verify'
            }
          },
          {
            path: 'apikey',
            meta: {
              title: 'API 密钥'
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
        name: 'Message',
        meta: {
          title: '消息管理',
          icon: 'aicon icon-xinbaniconshangchuan-',
          badge: 'message'
        }
      },
      {
        path: 'message/detail',
        meta: {
          title: '消息详情',
          hidden: true,
          backUrl: '../message',
          selectMenu: '/dns/message'
        }
      },

      /* ============================
       *         日志服务
       *  ============================
       * */
      {
        path: 'log',
        meta: {
          title: '日志服务',
          hSub: true,
          hiddenBreadcrumb: true
        },
        redirect: 'log/list',
        children: [
          {
            path: 'list',
            meta: {
              title: '日志服务',
              icon: 'aicon icon-rizhi',
              hiddenBreadcrumb: true,
              hidden: true,
              selectMenu: '/dns/log'
            }
          }
        ]
      }
    ]
  }
]
