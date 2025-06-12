import Vue from 'vue'
import ElementUI from 'element-ui'

// element 组件要按需导入 语言国际化方式，本项目采用的全部引入，所以不采用改方式
// import ElementLocale from 'element-ui/lib/locale'

import VueI18n from 'vue-i18n'

const locales = require(`../v2/${process.env.VUE_APP_NAME}/i18n-langs`).default || {}

Vue.use(VueI18n)

const DEFAULT_LANG = 'cn'
const LOCALE_KEY = 'localeLanguage'
const i18n = new VueI18n({
    locale: window.localStorage.getItem(LOCALE_KEY) || DEFAULT_LANG,
    messages: locales
})

// 1、将当前语种存到 localStorage中，保存用户的使用习惯；
// 2、给body添加语种相关的class，因为不同语言可能导致排版出现差异，我们需要适配；
// 3、将当前语种存到Vue的全局配置中，以便未来可能的使用
export const setup = lang => {
    if (lang === undefined) {
        lang = window.localStorage.getItem(LOCALE_KEY)
        if (locales[lang] === undefined) {
            lang = DEFAULT_LANG
        }
    }
    window.localStorage.setItem(LOCALE_KEY, lang)

    Object.keys(locales).forEach(lang => {
        document.body.classList.remove(`lang-${lang}`)
    })
    document.body.classList.add(`lang-${lang}`)
    document.body.setAttribute('lang', lang)

    Vue.config.lang = lang
    i18n.locale = lang
}

// 实现element插件的多语言切换，这种方式仅适用于 element 组件按需导入的
// ElementLocale.i18n((key, value) => i18n.t(key, value))

Vue.use(ElementUI, {
    i18n: (key, value) => i18n.t(key, value)
})

window.i18n = i18n

// 后台动态初始化语言，所以不在这里初始化
// setup()
export default i18n
