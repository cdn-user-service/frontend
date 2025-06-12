// 这是项目发布阶段需要用到的 babel 插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      },
      '@babel/plugin-transform-runtime' // 用于减少ES6转ES5的冗余代码
    ],
    [ // vxe-table 按需加载
      'import',
      {
        libraryName: 'vxe-table',
        style: true // 样式是否也按需加载
      },
      'vxe-table'
    ],
    // 发布产品阶段的插件数组
    ...prodPlugins,
    '@babel/plugin-syntax-dynamic-import'
  ]
}
