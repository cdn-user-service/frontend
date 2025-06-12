import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// import './request'

import i18n from '@/i18n'

// 公共配置
import '@/global/main.global'

// 全局配置接口、用户信息接口
import rootConfig from './extra/root'

new Vue({
  i18n,
  router,
  store,
  render: h => h(App),
  data() {
    return {
      ...rootConfig.data
    }
  },
  created() {
    // favicon 图标
    const LINK_NODE_ARR = document.querySelectorAll('link[rel="icon"]')
    LINK_NODE_ARR[LINK_NODE_ARR.length - 1].href = this.webConfig.basic.favicon
    this.getWebConfigData()
  },
  methods: {
    ...rootConfig.methods
  }
}).$mount('#app')
