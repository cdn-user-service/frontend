const CompressionPlugin = require('compression-webpack-plugin')
const path = require('path')

// 自定义主题插件
// const ThemeColorReplacer = require('webpack-theme-color-replacer')
// const forElementUI = require('webpack-theme-color-replacer/forElementUI')
// const { themeConfig, lightArr } = require('./src/global/colors')

// 多项目分别打包
const CLI_CONFIG = require('./cli-config')

// 检测网页更新并通知用户刷新
// const {
//   WebUpdateNotificationPlugin
// } = require('@plugin-web-update-notification/webpack')

// 用于提升打包速度
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

// HTML压缩插件
// const HtmlWebpackPlugin = require('html-webpack-plugin')

// CSS代码压缩插件
// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const TerserPlugin = require('terser-webpack-plugin')

// 打包分析工具
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

// css进行tree shaking优化
// const PurgeCssPlugin = require('purgecss-webpack-plugin')

const debug = process.env.NODE_ENV === 'development'

module.exports = {
  // 设置打包文件相对路径
  // publicPath: CLI_CONFIG.PublicPath,
  publicPath: './',
  // 设置打包文件输出路径
  outputDir: CLI_CONFIG.OutputDir,
  pages: CLI_CONFIG.pages,
  // 去掉 .map 文件
  productionSourceMap: debug,
  parallel: true, // 是否并行打包
  // webpack插件
  configureWebpack: (config) => {
    return {
      ...(!debug
        ? {
          optimization: {
            // 代码分离
            splitChunks: {
              chunks: 'all',
              // maxSize: 10000 // 最大块大小
              maxInitialRequests: Infinity,
              minSize: 20000
            },
            // Tree Shaking，减少未使用的代码
            usedExports: true,
            sideEffects: false
          },

          module: {
            rules: [
              {
                test: /\.js$/,
                use: 'thread-loader'
              },
              {
                // 如果项目源码中只有 js 文件就不要写成 /\.jsx?$/，提升正则表达式性能
                test: /\.js$/,
                // babel-loader 支持缓存转换出的结果，通过 cacheDirectory 选项开启
                use: ['babel-loader?cacheDirectory'],
                // 只对项目根目录下的 src 目录中的文件采用 babel-loader
                include: path.resolve(__dirname, 'src')
              }
            ]
          }
        }
        : null),

      resolve: {
        // 解析到文件时自动添加拓展名
        extensions: ['.warm', '.mjs', '.js', '.json'],
        // 使用绝对路径指明第三方模块存放的位置，以减少搜索步骤
        // 其中 __dirname 表示当前工作目录，也就是项目根目录
        modules: [path.resolve(__dirname, 'node_modules')]
      },

      // 分离库，启用 <script> 手动导入
      externals: {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        'element-ui': 'ELEMENT',
        xlsx: 'XLSX'
        // echarts: 'echarts'
      },

      plugins: [
        // // 生成仅包含颜色的替换样式（主题色等）
        // new ThemeColorReplacer({
        //   fileName: 'css/theme-colors.[contenthash:8].css',
        //   matchColors: themeConfig.getThemeColors(
        //     themeConfig.primaryColor,
        //     forElementUI.getElementUISeries,
        //     ThemeColorReplacer.varyColor,
        //     [...lightArr]
        //   ),
        //   changeSelector: forElementUI.changeSelector,
        //   isJsUgly: debug ? undefined : true,
        //   // 选择将css文本注入到 js 文件，无需再下载css，提升了首次撤换主题的速度
        //   injectCss: true
        //   // isJsUgly: true
        // }),

        ...(!debug
          ? [
            // 打包分析
            new BundleAnalyzerPlugin({
              analyzerMode: 'static' // 'static'模式会生成一个 report.html 文件在输出目录 (dist)
            }),

            // CSS 代码 tree shaking优化
            // new PurgeCssPlugin({
            //   path: glob.sync(`${path.resolve('./src')}/**/*`, {
            //     nodir: true
            //   }) // src里面的所有文件
            //   // satelist: function () {
            //   //   return {
            //   //     standard: ['html']
            //   //   }
            //   // }
            // }),

            // JS代码压缩
            new TerserPlugin({
              // 电脑cpu核数-1，使用多进程并发运行提高构建的速度，默认值是true，并发运行的默认数量： os.cpus().length - 1
              parallel: true,
              // extractComments：默认值为true，表示会将注释抽取到一个单独的文件中，开发阶段，我们可设置为 false ，不保留注释
              extractComments: false
            })

            // CSS代码压缩
            // new CssMinimizerPlugin({
            //   parallel: true
            // }),

            // HTML压缩
            // new HtmlWebpackPlugin({
            //   minify: {
            //     minifyCSS: false, // 是否压缩css
            //     collapseWhitespace: false, // 是否折叠空格
            //     removeComments: true // 是否移除注释
            //   }
            // }),

            // 检测网页更新并通知用户刷新
            // new WebUpdateNotificationPlugin({
            //   versionType: 'build_timestamp',
            //   logVersion: true,
            //   checkInterval: 0,
            //   // injectFileBase: './',
            //   notificationConfig: {
            //     primaryColor: '#177DFF'
            //   }
            // })
          ]
          : [])
      ]
    }
  },
  chainWebpack: (config) => {
    // 使用打包缓存
    // config.plugin('cache').use(HardSourceWebpackPlugin)

    config.module.rule('js').use('cache-loader').loader('cache-loader').end()

    // 发布模式
    config.when(!debug, (config) => {
      // 开启js、css压缩
      config.plugin('compressionPlugin').use(
        new CompressionPlugin({
          // test: /\.js$|\.html$|.\css/, // 匹配文件名
          test: /\.(css|js)$/, // 哪些文件需要压缩
          minRatio: 0.5, // 至少压缩的比例
          algorithm: 'gzip', // 采用的压缩算法
          threshold: 10240, // 对超过10k的数据压缩
          deleteOriginalAssets: false // 不删除源文件, 为 true 时需要 配置 nginx 的gzip
        })
      )
    })

    // 开发模式
    config.when(debug, (config) => { })
  },

  // 本地代理
  devServer: {
    // 请求地址的端口号
    port: CLI_CONFIG.port,
    proxy: {
      // 'demo'是请求地址中，以demo开头都适用这个
      '/cdn_api': {
        // 真实的服务器地址
        // target: 'https://demo.antsxdp.com',
        // 测试改为本地地址
        target: 'http://localhost:18080',
        //
        changeOrigin: true,
        // 默认情况下，不接受运行在 HTTPS 上，且使用了无效证书的后端服务器。如果你想要接受设为false
        secure: false,
        // 是否启用websockets
        ws: true,
        // 是否重写
        pathRewrite: {
          '^/cdn_api': ''
        }
      },
      '/dns_api': {
        target: 'https://www.vedns.com',
        changeOrigin: true,
        secure: false,
        ws: true,
        pathRewrite: {
          '^/dns_api': ''
        }
      }
    }
  }
}
