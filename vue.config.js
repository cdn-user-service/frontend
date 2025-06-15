const CompressionPlugin = require('compression-webpack-plugin')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const ALL_CONFIG = require('./cli-config')
const projectName = process.env.RUNNAME || 'cdn_users_v2'
const config = ALL_CONFIG[projectName]

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  publicPath: './',
  outputDir: config.OutputDir,
  pages: config.pages,
  productionSourceMap: isDev,
  parallel: true,
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@use "@/assets/css/variables.scss" as *;`
      }
    }
  },

  configureWebpack: (cfg) => {
    const baseConfig = {
      resolve: {
        extensions: ['.mjs', '.js', '.json'],
        modules: [path.resolve(__dirname, 'node_modules')]
      },
      externals: {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        'element-ui': 'ELEMENT',
        xlsx: 'XLSX'
      },
      plugins: []
    }

    if (!isDev) {
      baseConfig.optimization = {
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 20000
        },
        usedExports: true,
        sideEffects: false
      }

      baseConfig.module = {
        rules: [
          {
            test: /\.js$/,
            use: ['thread-loader', 'babel-loader?cacheDirectory'],
            include: path.resolve(__dirname, 'src')
          }
        ]
      }

      baseConfig.plugins.push(
        new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
        new TerserPlugin({
          parallel: true,
          extractComments: false
        })
      )
    }

    return baseConfig
  },

  chainWebpack: (config) => {
    // 推荐用 webpack5 自带缓存，无需cache-loader
    // 移除旧的cache-loader配置，提升构建性能
    config.module.rules.delete('cache-loader')

    if (!isDev) {
      config.plugin('compressionPlugin').use(
        new CompressionPlugin({
          test: /\.(css|js)$/,
          threshold: 10240,
          minRatio: 0.5,
          algorithm: 'gzip',
          deleteOriginalAssets: false
        })
      )
    }
  },

  devServer: {
    port: config.port,
    proxy: {
      '/cdn_api': {
        target: 'http://localhost:18080',
        changeOrigin: true,
        secure: false,
        ws: true,
        pathRewrite: { '^/cdn_api': '' }
      },
      '/dns_api': {
        target: 'https://www.vedns.com',
        changeOrigin: true,
        secure: false,
        ws: true,
        pathRewrite: { '^/dns_api': '' }
      }
    }
  }
}