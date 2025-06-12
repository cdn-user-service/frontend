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
   *         系统设置
   *  ============================
   * */
  {
    path: '/system/config',
    component: Layout,
    meta: {
      title: '系统设置',
      icon: 'el-icon-setting'
    },
    redirect: '/system/config/params',
    children: [
      {
        path: 'params',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/params'
          ),
        meta: {
          title: '配置概览',
          breadcrumb: true
        }
      },
      {
        path: 'site',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/site'
          ),
        meta: {
          title: '网站配置'
        },
        redirect: 'site/basic',
        children: [
          {
            path: 'basic',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/site/basic.vue'
              ),
            meta: {
              hidden: true,
              title: '基本设置',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'power',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/site/power.vue'
              ),
            meta: {
              hidden: true,
              title: '网站权限配置',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'contact',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/site/contact.vue'
              ),
            meta: {
              hidden: true,
              title: '联系方式',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'seo',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/site/seo.vue'
              ),
            meta: {
              hidden: true,
              title: 'SEO站内优化',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'agreement',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/site/agreement.vue'
              ),
            meta: {
              hidden: true,
              title: '同意协议',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'dir',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/site/dir.vue'
              ),
            meta: {
              hidden: true,
              title: '站点访问路径',
              hiddenBreadcrumb: true
            }
          }
        ]
      },
      {
        path: 'payment',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/payment'
          ),
        meta: {
          title: '支付配置',
          hiddenBreadcrumb: true
        },
        redirect: 'payment/wechat',
        children: [
          {
            path: 'wechat',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/payment/wechat.vue'
              ),
            meta: {
              hidden: true,
              title: '微信支付',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'alipay',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/payment/alipay.vue'
              ),
            meta: {
              hidden: true,
              title: '支付宝支付',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'stripe',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/payment/stripe.vue'
              ),
            meta: {
              hidden: true,
              title: 'Stripe支付',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'tokenpay',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/payment/tokenpay.vue'
              ),
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
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/verification'
          ),
        meta: {
          title: '实名配置',
          hiddenBreadcrumb: true
        },
        redirect: 'verification/wechat',
        children: [
          {
            path: 'wechat',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/verification/wechat.vue'
              ),
            meta: {
              hidden: true,
              title: '腾讯人脸核身',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'ali',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/verification/ali.vue'
              ),
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
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/email'
          ),
        meta: {
          title: '邮件配置',
          hiddenBreadcrumb: true
        },
        redirect: 'email/config',
        children: [
          {
            path: 'config',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/email/config.vue'
              ),
            meta: {
              hidden: true,
              title: '发送服务器配置',
              hiddenBreadcrumb: true
            }
          },
          {
            path: 'template',
            component: () =>
              import(
                /* webpackChunkName: "System" */ '../../views/system/config/email/template.vue'
              ),
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
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/sms'
          ),
        meta: {
          title: '短信配置',
          breadcrumb: false,
          hiddenBreadcrumb: true
        }
        // redirect: 'sms/config',
        // children: [
        //   {
        //     path: 'config',
        //     component: () =>
        //       import(
        //         /* webpackChunkName: "System" */ '../../views/system/config/sms/config.vue'
        //       ),
        //     meta: {
        //       hidden: true,
        //       title: '腾讯短信配置'
        //     }
        //   },
        //   {
        //     path: 'template',
        //     component: () =>
        //       import(
        //         /* webpackChunkName: "System" */ '../../views/system/config/sms/template.vue'
        //       ),
        //     meta: {
        //       hidden: true,
        //       title: '短信模板配置'
        //     }
        //   }
        // ]
      },
      {
        path: 'wechat-code',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/wechatScanCode'
          ),
        meta: {
          title: '微信扫码',
          breadcrumb: true
        }
      },
      {
        path: 'login',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/login'
          ),
        meta: {
          title: '注册登录',
          breadcrumb: true
        }
      },
      {
        path: 'node',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/node'
          ),
        meta: {
          title: '节点安装',
          breadcrumb: true
        }
      },
      {
        path: 'backup',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/backup'
          ),
        meta: {
          title: '数据备份',
          breadcrumb: true
        }
      },
      {
        path: 'other-url',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/other-url'
          ),
        meta: {
          title: 'CDN客户端',
          breadcrumb: true,
          custom: 'other-url'
        }
      },
      {
        path: 'ssl',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/config/ssl'
          ),
        meta: {
          title: 'SSL证书',
          breadcrumb: true
        }
      }
    ]
  },

  /* ============================
   *         定时任务
   *  ============================
   * */
  {
    path: '/system/schedule',
    name: 'TaskManager',
    component: Layout,
    meta: {
      title: '定时任务',
      icon: 'el-icon-time'
    },
    redirect: '/system/schedule/list',
    children: [
      {
        path: 'list',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/schedule/list'
          ),
        meta: {
          title: '任务列表',
          breadcrumb: true
        }
      },
      {
        path: 'log',
        component: () =>
          import(
            /* webpackChunkName: "System" */ '../../views/system/schedule/log'
          ),
        meta: {
          title: '任务日志',
          breadcrumb: true
        }
      }
    ]
  }
]
