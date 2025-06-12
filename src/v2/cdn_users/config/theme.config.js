/**
 * @description 导出主题配置，注意：修改后需清理浏览器缓存！！！
 */
 module.exports = {
    // 控制台布局种类-主题模式
    layoutTheme: {
        // 页面布局结构，ttb = 上下布局， ltr = 左右布局
        layoutMode: 'ttb', 
        // 控制台头部背景模式，light = 浅色， dark = 深色
        headerTheme: 'dark', 
        // 控制台侧边栏菜单背景模式，light = 浅色， dark = 深色  
        asideTheme: 'light',
        // 控制台主体背景模式，light = 浅色， dark = 深色  
        mainTheme: 'light'
    },

    // 控制台顶部 action 功能显示隐藏
    headerActionItem: {
        // 是否显示前往首页
        showGoHome: true,
        // 是否显示前往帮助文档
        showHelp: true,
        // 是否显示消息抽屉组件
        showMessage: true,
        // 是否显示全屏组件
        showFullScreen: true,
        // 是否显示锁屏组件
        showLockScreen: false,
        // 是否显示语言选择组件
        showI18n: true,
        // 是否显示刷新页面组件
        showRefresh: true
    },

    // 自定义表格样式
    tabelConfig: {
        // 表格是否显示斑马纹，0 = 隐藏， 1 = 显示 
        stripe: 0,
        // 表格是否显示边框，0 = 隐藏， 1 = 显示 
        border: 0,
        // 表格大小，medium = 大，small = 中， mini = 小
        size: 'small',
        // 表格对齐方式，left = 居左，center = 居中，right = 居右
        align: 'left',
        // 表格分页大小
        pagesize: 20
    }
}
