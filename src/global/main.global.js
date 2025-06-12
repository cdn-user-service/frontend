import Vue from 'vue'
// 由于本项目 element所有的组件基本都有使用，就不采用按需引入，
// 为了配置 element 语言国际化，在 i18n.js 文件中统一引入 element
// import ElementUI from 'element-ui'
// element 按需引入
// import './element.js'

import 'element-ui/lib/theme-chalk/display.css'

// element 自定义主题
import '@/plugins/element-theme/index.css'
import '@/plugins/element-theme/fonts/element-icons.ttf'
import '@/plugins/element-theme/fonts/element-icons.woff'

// 字体图标
import '@/assets/fonts/newicon.css'

// 导入全局样式
import '@/assets/css/index.scss'

// 用于实现浏览器并不支持的原生API的代码(主要是兼容IE浏览器)
import 'polyfill-array-includes'

import 'wowjs/css/libs/animate.css'

import wow from 'wowjs'

// 工具函数
import '@/utils'

// 全局组件
import '../components/ants'

// 颜色插件
import vcolorpicker from 'vcolorpicker'

// 主题初始化
import { initThemeColor } from './change-theme-color'

import { debug, $mode } from '@/utils/env'

// CDN 获取产品参数数据
import { doGetProductAttr } from './enum'
const PROCESS_NAME = process.env.VUE_APP_NAME
if (PROCESS_NAME.indexOf('cdn') != -1) {
  doGetProductAttr()
}

initThemeColor()

// Vue.use(ElementUI)

Vue.use(vcolorpicker)

// 定制模块
Vue.prototype.debug = debug
Vue.prototype.$mode = $mode

Vue.prototype.$wow = new wow.WOW({
  // boxClass: 'wow',
  // animateClass: 'animated',
  offset: 0, // 定义浏览器视口底部与隐藏框顶部之间的距离。当用户滚动并到达此距离时，隐藏的框会显示出来
  mobile: false,
  live: false
})

Vue.config.productionTip = false
