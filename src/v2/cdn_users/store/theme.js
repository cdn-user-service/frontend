import {
    layoutTheme,
    headerActionItem,
    tabelConfig
} from '../config'

const state = {
    layoutTheme: { ...layoutTheme },
    headerActionItem: { ...headerActionItem },
    tabelConfig: { ...tabelConfig }
}

const mutations = {
    // 主题模式切换 FIMINS, 现在暂时是 布局模式和主题一起切换，后期可单独切换
    changeLayoutTheme(state, mode) {
        state.layoutTheme = mode
    },

    // 顶部 action 显示隐藏
    changeHeaderActionItem(state, actionStatus) {
        Object.keys(actionStatus).forEach(e => {
            state.headerActionItem[e] = actionStatus[e]
        })
    },

    // 自定义表格
    changeTabelConfig(state, configObj) {
        Object.keys(configObj).forEach(e => {
            state.tabelConfig[e] = configObj[e]
        })
    }
}
export { state, mutations }
