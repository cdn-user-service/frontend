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
    path: '/cdn',
    name: 'cdn',
    // type = 0 表示顶级菜单
    type: 0,
    meta: {
      icon: 'el-icon-s-marketing',
      title: '',
      isSub: true
    },
    redirect: '/cdn/dashboard',
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
       *         域名管理
       *  ============================
       * */
      {
        path: 'site',
        meta: {
          title: '站点管理',
          icon: 'aicon icon-baobiao',
          isSub: true
        },
        redirect: 'site/domain',
        children: [
          {
            path: 'domain',
            redirect: 'domain/list',
            meta: {
              title: '我的域名',
              allowAdmin: true,
              bindMobile: true,
              hSub: true
            },
            children: [
              {
                path: 'list',
                meta: {
                  title: '域名列表',
                  hidden: true,
                  allowAdmin: true,
                  bindMobile: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'group',
                meta: {
                  title: '域名分组',
                  hidden: true,
                  bindMobile: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },

          {
            path: 'domain/create',
            meta: {
              hidden: true,
              title: '添加域名',
              backUrl: './list'
            }
          },

          {
            path: 'domain/admin',
            redirect: 'domain/admin/basic',
            name: 'CdnDomainAdmin',
            meta: {
              hidden: true,
              hSub: true,
              backUrl: './domain',
              hiddenBreadcrumb: true
            },
            children: [
              {
                path: 'basic',
                meta: {
                  ttile: '基础配置',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'plan',
                meta: {
                  ttile: '套餐服务',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'backsource',
                meta: {
                  ttile: '回源配置',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'performance',
                meta: {
                  ttile: '性能优化',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'line',
                meta: {
                  ttile: '线路优化',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'advanced',
                meta: {
                  ttile: '高级配置',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'application-secure',
                meta: {
                  ttile: '应用安全',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'content-secure',
                meta: {
                  ttile: '内容安全',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'business-secure',
                meta: {
                  ttile: '业务安全',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'network-secure',
                meta: {
                  ttile: '网络安全',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'waf',
                name: 'SiteWaf',
                meta: {
                  ttile: '精准访问控制',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'log-access',
                meta: {
                  ttile: '请求日志',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'log-block',
                meta: {
                  ttile: '封禁日志',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'flow',
                meta: {
                  ttile: '流量带宽',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'origin',
                meta: {
                  ttile: '来源数据',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'code',
                meta: {
                  ttile: '状态码监控',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'upstream',
                meta: {
                  ttile: '回源监控',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },

          {
            path: 'bulk',
            meta: {
              title: '批量操作',
              bindMobile: true,
              hiddenBreadcrumb: true
            }
          },

          {
            path: 'cache-clear',
            meta: {
              title: '预热更新',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'cache-clear/clear',
            children: [
              {
                path: 'clear',
                meta: {
                  title: '刷新缓存',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'preheat',
                meta: {
                  title: '预热更新',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },

          {
            path: 'certificate',
            meta: {
              title: '证书管理',
              bindMobile: true
            }
          },

          // URL转发：仅定制用户才显示，
          {
            path: 'rewrite',
            meta: {
              title: 'URL转发',
              // 定制的页面, rewrite 表示 URL转发
              custom: 'rewrite'
            }
          },
          {
            path: 'force',
            meta: {
              title: '强制跳转',
              bindMobile: true,
              custom: 'force'
            }
          },

          // {
          //   path: 'access-token',
          //   meta: {
          //     title: 'DNS服务',
          //     custom: 'access-token'
          //   }
          // },
          {
            path: 'dns',
            meta: {
              title: 'DNS设置'
              // custom: 'dns'
            }
            // children: [
            //   {
            //     path: 'record',
            //     meta: {
            //       title: '解析记录管理',
            //       custom: 'record'
            //     }
            //   }
            // ]
          },
          {
            path: 'dns/record',
            name: 'record',
            meta: {
              title: '解析记录管理',
              // custom: 'record',
              hidden: true,
              backUrl: '../dns',
              selectMenu: '/cdn/site/dns'
            }
          }
        ]
      },

      /* ============================
       *         四层转发
       *  ============================
       * */
      {
        path: 'stream',
        meta: {
          title: '四层转发',
          icon: 'aicon icon-zhuanfa1',
          isSub: true
        },
        redirect: 'stream/list',
        children: [
          {
            path: 'list',
            meta: {
              title: '四层转发'
            }
          },

          {
            path: 'es',
            meta: {
              title: '转发监控',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'top',
            meta: {
              title: '转发排行',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'log',
            meta: {
              title: '转发日志',
              hiddenBreadcrumb: true
            }
          }
        ]
      },

      /* ============================
       *         流量分析
       *  ============================
       * */
      {
        path: 'es',
        meta: {
          title: '流量分析',
          icon: 'el-icon-document',
          isSub: true
        },
        redirect: 'es/site',
        children: [
          {
            path: 'site',
            // redirect: 'site/flow',
            meta: {
              title: '站点流量',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'top',
            meta: {
              title: '请求排行',
              hiddenBreadcrumb: true
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
        redirect: 'analysis/node',
        children: [
          {
            path: 'query',
            meta: {
              title: '请求查询',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'query/access',
            children: [
              {
                path: 'access',
                name: 'AnalysisQueryAccess',
                meta: {
                  title: '请求日志',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'block',
                meta: {
                  title: '封禁日志',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },
          {
            path: 'ontime',
            name: 'AnalysisRealTimeLog',
            meta: {
              title: '实时连接',
              hiddenBreadcrumb: true
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
        name: 'Meal',
        meta: {
          title: '套餐管理',
          icon: 'el-icon-box',
          isSub: true
        },
        redirect: 'plan/own',
        children: [
          {
            path: 'own',
            redirect: 'own/list',
            meta: {
              title: '我的套餐',
              hSub: true,
              hiddenBreadcrumb: true
            },
            children: [
              {
                // 使用中
                path: 'list',
                meta: {
                  title: '套餐列表',
                  hidden: true,
                  bindMobile: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },
          {
            path: 'purchase',
            meta: {
              title: '购买套餐',
              bindMobile: true,
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'vas',
            redirect: 'vas/list',
            meta: {
              title: '增值业务',
              hSub: true,
              hiddenBreadcrumb: true
            },
            children: [
              {
                // 使用中
                path: 'list',
                meta: {
                  title: '增值业务列表',
                  hidden: true,
                  bindMobile: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },

          {
            path: 'usage',
            meta: {
              title: '用量查询'
            }
          }
        ]
      },

      /* ============================
       *         财务中心
       *  ============================
       * */
      {
        path: 'finance',
        meta: {
          title: '财务中心',
          icon: 'el-icon-bank-card',
          isSub: true
        },
        redirect: 'finance/order',
        children: [
          {
            path: 'order',
            redirect: 'order/14',
            meta: {
              title: '我的订单',
              hSub: true,
              hiddenBreadcrumb: true
            },
            children: [
              {
                path: '14',
                meta: {
                  title: '订单列表',
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
       *         个人中心
       *  ============================
       * */
      {
        path: 'account',
        meta: {
          title: '个人中心',
          icon: 'el-icon-user',
          isSub: true
        },
        redirect: 'account/info',
        children: [
          {
            path: 'info',
            meta: {
              title: '账号信息',
              allowAdmin: true,
              bindMobile: true
            }
          },
          {
            path: 'verification',
            name: 'Verification',
            meta: {
              title: '实名认证',
              // 定制的页面, verify 表示 实名认证
              custom: 'verify'
            }
          },
          {
            path: 'login-white-ip',
            meta: {
              title: '登录白名单'
            }
          }
        ]
      },

      /* ============================
       *         工单管理
       *  ============================
       * */
      {
        path: 'work-order',
        meta: {
          title: '工单管理',
          icon: 'el-icon-s-order',
          isSub: true
        },
        redirect: 'work-order/list',
        children: [
          {
            path: 'list',
            meta: {
              title: '工单列表',
              hiddenBreadcrumb: true,
              hSub: true
            },
            redirect: 'list/status',
            children: [
              {
                path: 'status',
                meta: {
                  title: '工单列表',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },
          {
            path: 'list/detail',
            name: 'WorkOrderDetail',
            meta: {
              title: '工单详情',
              hidden: true,
              backUrl: '../list'
            }
          },
          {
            path: 'submit',
            meta: {
              title: '提交工单'
            },
            redirect: 'submit/step-1',
            children: [
              {
                path: 'step-1',
                meta: {
                  title: '第一步',
                  hidden: true,
                  step: 0
                }
              },
              {
                path: 'step-2',
                meta: {
                  title: '第二步',
                  hidden: true,
                  step: 1
                }
              },
              {
                path: 'step-3',
                meta: {
                  title: '第三步',
                  hidden: true,
                  step: 2
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
        path: 'message',
        name: 'Message',
        meta: {
          title: '消息管理',
          icon: 'aicon icon-xinbaniconshangchuan-'
          // 显示badge计数
          // badge: 'message'
        }
      },
      {
        path: 'message/detail',
        meta: {
          title: '消息详情',
          hidden: true,
          backUrl: '../message',
          selectMenu: '/cdn/message'
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
          icon: 'aicon icon-rizhi',
          hSub: true,
          hiddenBreadcrumb: true
        },
        redirect: 'log/list',
        children: [
          {
            path: 'list',
            meta: {
              title: '日志服务',
              hiddenBreadcrumb: true,
              hidden: true,
              selectMenu: '/cdn/log'
            }
          }
        ]
      }
    ]
  }
]
