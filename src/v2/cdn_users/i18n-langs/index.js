import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

// 公共语言包部分
const comLangs = require.context('@/v2/cdn_common/i18n-langs', true, /\.js$/)
const langs = require.context('./', true, /\.js$/)

// 前后台共有的
let com = {}
comLangs.keys().forEach(key => {
  com = {
    ...com,
    ...comLangs(key).default
  }
})

// 英文
let en = {}
langs.keys().forEach(key => {
  en = {
    ...en,
    ...langs(key).default
  }
})

en = {
  ...com,
  ...en
}

// 中文
const cn = {}
Object.keys(en).map(it => {
    cn[it] = it
})

export default {
    cn: {
        ...zhLocale,
        ...cn
    },
    en: {
        ...enLocale,
        ...en
    }
}
