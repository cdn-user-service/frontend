import Vue from 'vue'
// import XEUtils from 'xe-utils'
import {
    // 核心
    VXETable,
    Header,
    Column,
    Colgroup,
    Checkbox,
    Tooltip,
    Table
} from 'vxe-table'
VXETable.setup({
    zIndex: 100,
    table: {
        //   showHeader: true,
        //   keepSource: false,
        //   delayHover: 250,
        showOverflow: null,
        //   showHeaderOverflow: null,
        //   showFooterOverflow: null,
        size: 'small',
        //   resizable: false,
        autoResize: true,
        //   stripe: false,
        //   border: false,
        //   round: false,
        emptyText: '暂无数据'
        //   radioConfig: {
        //     trigger: 'default'
    }
})
Vue.use(Column)
    .use(Colgroup)
    .use(Checkbox)
    .use(Table)
    .use(Header)
    .use(Tooltip)
