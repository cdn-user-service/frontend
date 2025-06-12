import Vue from 'vue'

export function translateTitle(title) {
    if (this.$te(title)) return this.$t(title)
    return title
}

// 分开翻译多个
export function translateTitlePlus(titleArr = []) {
    let title = ''
    titleArr.forEach(item => {
        title += (this.$te(item) ? this.$t(item) : item) + ' '
    })
    return title
}

// 用于一些 js 文件翻译
export function windowTranslateTitle(title) {
    if (window.i18n.te(title)) return window.i18n.t(title)
    return title
}

Vue.prototype.antsT = translateTitle
Vue.prototype.antsTP = translateTitlePlus
