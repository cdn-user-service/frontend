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
    path: '/system',
    // type = 0 表示顶级菜单
    type: 0,
    meta: {
      icon: 'el-icon-setting',
      title: '系统设置',
      isSub: true
    },
    redirect: '/system/config',
    children: [
      /* ============================
       *         系统设置
       *  ============================
       * */
      {
        path: 'config',
        meta: {
          title: '系统设置',
          icon: 'el-icon-setting',
          isSub: true
        },
        redirect: 'config/params',
        children: [
          {
            path: 'params',
            meta: {
              title: '配置概览'
            }
          },
          {
            path: 'site',
            meta: {
              title: '网站配置',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'site/basic',
            children: [
              {
                path: 'basic',
                meta: {
                  title: '基本设置',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'power',
                meta: {
                  title: '网站权限配置',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'contact',
                meta: {
                  title: '联系方式',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'seo',
                meta: {
                  title: 'SEO站内优化',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'agreement',
                meta: {
                  title: '同意协议',
                  hidden: true,
                  hiddenBreadcrumb: true
                }
              }
            ]
          },
          {
            path: 'payment',
            meta: {
              title: '支付配置',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'payment/wechat',
            children: [
              {
                path: 'wechat',
                meta: {
                  hidden: true,
                  title: '微信支付',
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'alipay',
                meta: {
                  hidden: true,
                  title: '支付宝支付',
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'stripe',
                meta: {
                  hidden: true,
                  title: 'Stripe支付',
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'tokenpay',
                meta: {
                  hidden: true,
                  title: 'Stripe支付',
                  hiddenBreadcrumb: true
                }
              }
            ]
          },

          {
            path: 'verification',
            meta: {
              title: '实名配置',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'verification/wechat',
            children: [
              {
                path: 'wechat',
                meta: {
                  hidden: true,
                  title: '腾讯人脸核身',
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'ali',
                meta: {
                  hidden: true,
                  title: '支付宝实人认证',
                  hiddenBreadcrumb: true
                }
              }
            ]
          },

          {
            path: 'email',
            meta: {
              title: '邮件配置',
              hSub: true,
              hiddenBreadcrumb: true
            },
            redirect: 'email/config',
            children: [
              {
                path: 'config',
                meta: {
                  hidden: true,
                  title: '发送服务器配置',
                  hiddenBreadcrumb: true
                }
              },
              {
                path: 'template',
                meta: {
                  hidden: true,
                  title: '邮件模板配置',
                  hiddenBreadcrumb: true
                }
              }
            ]
          },
          {
            path: 'sms',
            meta: {
              title: '短信配置',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'wechat-code',
            meta: {
              title: '微信扫码'
            }
          },
          {
            path: 'login',
            meta: {
              title: '注册登录'
            }
          },
          {
            path: 'node',
            meta: {
              title: '节点安装'
            }
          },
          {
            path: 'backup',
            meta: {
              title: '数据备份'
            }
          }
        ]
      },

      /* ============================
       *         定时任务
       *  ============================
       * */
      {
        path: 'schedule',
        meta: {
          title: '定时任务',
          icon: 'el-icon-time',
          isSub: true
        },
        redirect: 'schedule/list',
        children: [
          {
            path: 'list',
            meta: {
              title: '任务列表'
            }
          },
          {
            path: 'log',
            meta: {
              title: '任务日志'
            }
          }
        ]
      }
    ]
  }
]
