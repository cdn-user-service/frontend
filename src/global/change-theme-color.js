import { themeConfig, lightArr, darkArr } from './colors'

// 主题基本色
export let curColor = themeConfig.primaryColor

// 动态切换主题色
export function changeThemeColor(newColor = curColor, newOtherColors = lightArr) {
    curColor = newColor
    localStorage.setItem('theme_color', curColor)
    // 这里可以添加自定义的主题切换逻辑
    return Promise.resolve()
}

// 主题初始化
export function initThemeColor() {
    const savedColor = localStorage.getItem('theme_color') || curColor
    const saveThemeMode = localStorage.getItem('themeMode') || 'light'
    document.body.style.display = 'none'
    curColor = savedColor
    changeThemeColor(savedColor, saveThemeMode === 'dark' ? darkArr : lightArr).finally(() => {
        document.body.style.display = ''
    })
}
