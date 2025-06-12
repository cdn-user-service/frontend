const elementColor = {
  primary: '#177DFF',
  success: '#02B340',
  error: '#F52544',
  danger: '#F52544',
  warning: '#ff9d00',
  price: '#ff7a22',
  // 用于不需要 深浅模式 切换的颜色
  white: '#fefefe',
  black: '#333',
  'login-bg-color': '#222431'
}

const antsColor = {
  'primary-light': {
    light: '#E8F2FF',
    dark: '#1A1C28'
  },

  // 背景色， 浅 --> 深
  'ants-bg-1': {
    light: '#fff',
    // dark: '#252B3B'
    dark: '#222430'
  },
  'ants-bg-2': {
    light: '#FAFAFA',
    // dark: '#1D222E',
    dark: '#1A1C27'
  },
  'ants-bg-3': {
    light: '#F4F4F5',
    dark: '#2D3448'
  },
  'ants-bg-4': {
    light: '#F5F7FA',
    dark: '#3F4153'
  },
  'ants-bg-5': {
    light: '#F2F2F2',
    dark: '#2B3244'
  },
  'ants-bg-6': {
    light: '#d5e7ff',
    dark: '#1D222d'
  },

  // 字体色， 深 --> 浅，跟element 颜色一致
  'ants-text-1': {
    light: '#303133',
    dark: '#f7f7f7'
  },
  'ants-text-2': {
    light: '#454545',
    dark: '#e4e4e4'
  },
  'ants-text-3': {
    light: '#606266',
    dark: '#d0d0d0'
  },
  'ants-text-4': {
    light: '#909399',
    dark: '#bcbcbc'
  },
  'ants-text-5': {
    light: '#a8abb2',
    dark: '#B9B7B7'
  },
  'ants-text-6': {
    light: '#C0C4CC',
    dark: '#a9a9a9'
  },

  // 边框色， 深 --> 浅，跟element 颜色一致
  'ants-border-1': {
    light: '#DCDFE6',
    dark: '#31394e'
  },
  'ants-border-2': {
    light: '#E4E7ED',
    dark: '#404040'
  },
  'ants-border-3': {
    light: '#EBEEF5',
    dark: '#313961'
  },
  'ants-border-4': {
    light: '#F2F6FC',
    dark: '#2D3448'
  },
  'white-rgb': {
    light: '255,255,255',
    rgb: 'rgb(255,255,255)',
    // dark: '37,43,59'
    dark: '34,36,48'
  },
  // 由于打包后有些 rbg 会被转换为 hsla，所以设置一组 hsla 的样式
  'white-hsla': {
    light: '0,0%,100%',
    rgb: 'hsla(0,0%,100%)',
    // dark: '224,23%,19%'
    dark: '224,23%,19%'
  }
  // 'black-rgb': {
  //     light: '0,0,0',
  //     dark: '250,250,250'
  // }
}

const themeConfig = {
  description: '主题色配置',
  primaryColor: elementColor.primary,
  getThemeColors: function (color, getElementUISeries, varyColor, others) {
    const colors = getElementUISeries(color) // element-ui主色系列
    colors.push(
      varyColor.mix('#000', color, 0.1),
      varyColor.mix('#000', color, 0.2),
      varyColor.mix('#000', color, 0.7)
    )
    colors.push.apply(colors, others)
    return colors
  }
}

const lightArr = []
const darkArr = []
const lightObj = {}
const darkObj = {}

Object.keys(antsColor).forEach((item) => {
  // 输出数组
  lightArr.push(antsColor[item].light)
  darkArr.push(antsColor[item].dark)

  // 输出对象
  lightObj[item] = antsColor[item].rgb || antsColor[item].light
  darkObj[item] = antsColor[item].dark
})

module.exports = {
  elementColor,
  themeConfig,
  lightArr,
  darkArr,
  lightObj,
  darkObj
}
