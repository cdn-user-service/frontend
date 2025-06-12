// 多项目分别打包配置
const config = {
  /** =============================
   *               CDN系统
   *  =============================
   */
  // cdn-users
  cdn_users_v2: {
    name: 'cdn_users_v2',
    port: '8001',
    // 设置打包文件相对路径
    // PublicPath: '/users/',
    PublicPath: './',
    // 设置打包文件输出路径
    OutputDir: 'dist/cdn_users_v2',
    pages: {
      index: {
        // 入口文件
        entry: 'src/v2/cdn_users/main.js',
        // 模板来源
        template: 'public/index.html',
        // 打包后 dist 输出文件名
        filename: 'index.html'
      }
    }
  },
  cdn_admin_v2: {
    name: 'cdn_admin_v2',
    port: '8002',
    // 这个值也可以被设置为空字符串 ('') 或是相对路径 ('./')，这样所有的资源都会被链接为相对路径，这样打出来的包可以被部署在任意路径
    PublicPath: './',
    OutputDir: 'dist/cdn_admin_v2',
    pages: {
      index: {
        entry: 'src/v2/cdn_admin/main.js',
        template: 'public/index.html',
        filename: 'index.html'
      }
    }
  },

  /** =============================
   *               DNS系统
   *  =============================
   */
  dns_admin_v2: {
    name: 'dns_admin_v2',
    port: '8004',
    // 这个值也可以被设置为空字符串 ('') 或是相对路径 ('./')，这样所有的资源都会被链接为相对路径，这样打出来的包可以被部署在任意路径
    PublicPath: './',
    OutputDir: 'dist/dns_admin_v2',
    pages: {
      index: {
        entry: 'src/v2/dns_admin/main.js',
        template: 'public/index.html',
        filename: 'index.html'
      }
    }
  },
  dns_users_v2: {
    name: 'dns_users_v2',
    port: '8005',
    // 这个值也可以被设置为空字符串 ('') 或是相对路径 ('./')，这样所有的资源都会被链接为相对路径，这样打出来的包可以被部署在任意路径
    PublicPath: './',
    OutputDir: 'dist/dns_users_v2',
    pages: {
      index: {
        entry: 'src/v2/dns_users/main.js',
        template: 'public/index.html',
        filename: 'index.html'
      }
    }
  }
}

// const projectName = require('./project')
// const configObj = config[projectName.name]

// console.log(process.env.RUNNAME)

// process.env.RUNNAME 为进程的名称，也就是要打包的项目名称
const configObj = config[process.env.RUNNAME]
module.exports = configObj
