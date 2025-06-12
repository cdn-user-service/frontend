const { elementColor, lightObj } = require('./src/global/colors')
const colors = {
  ...elementColor,
  ...lightObj
}

module.exports = {
  // future: {
  //   removeDeprecatedGapUtilities: true,
  //   purgeLayersByDefault: true
  // },
  /**
   * https://v1.tailwindcss.com/docs/controlling-file-size
   * 清除未使用的css，减小包体积, 此列表应包括项目中按名称引用任何样式的所有文件，
   * 只在生产环境生效、开发环境不生效，enabled: true, 可自动设置，不建议
   * 打包速度太慢了，暂时关掉
   */
  // purge: {
  //   layers: ['base', 'components', 'utilities'],
  //   content: [
  //     './src/components/**/*.vue',
  //     './src/components/**/*.js',
  //     './src/v2/**/*.vue',
  //     './src/v2/**/*.js'
  //   ]
  // },
  theme: {
    colors,
    boxShadow: {
      default: '0px 1px 15px 1px rgba(0, 0, 0, 0.05)'
    },
    extend: {
      spacing: {
        xs: '0.8rem',
        sm: '1rem',
        md: '1.2rem',
        df: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        xxl: '4rem',
        xxxl: '5rem'
      }
    }
  },
  variants: {},
  plugins: []
}
