import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate' // 刷新页面数据持久化插件
import { state as themeState, mutations as themeMutations } from './theme'

Vue.use(Vuex)

const modulesFiles = require.context('./modules', true, /\.js$/)
// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((module, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  module[moduleName] = {
    ...value.default,
    namespaced: true
  }
  return module
}, {})

export default new Vuex.Store({
  modules,
  state: {
    ...themeState,
    // 语言 cn|en
    lang: 'cn',

    isPhone: false, // 是否为小屏幕

    isMobileAsideShow: false,
    device: document.body.clientWidth < 992 ? 'pad' : 'pc' // 设备， pc、pad、mobile
  },
  mutations: {
    ...themeMutations,

    changeIsPhone(state, flag) {
      state.isPhone = flag
    },

    // 切换语言
    toggleLang(state, val) {
      state.lang = val
    },

    // 屏幕设备切换
    changeDevice(state, val) {
      state.device = val
    },

    // 小屏幕下 aside 显示隐藏
    toggleMobileAsideShow(state, show) {
      state.isMobileAsideShow = show
    },

    // 主题切换组件显示隐藏
    changeIsOpenTheme(state) {
      state.isOpenTheme = !state.isOpenTheme
    }
  },
  actions: {},
  plugins: [
    createPersistedState({
      storage: window.localStorage,
      reducer(val) {
        return {
          lang: val.lang,
          layoutTheme: val.layoutTheme,
          headerActionItem: val.headerActionItem,
          tabelConfig: val.tabelConfig
        }
      }
    })
  ]
})
