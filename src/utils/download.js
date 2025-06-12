import XLSX from 'xlsx'
import { saveAs } from 'file-saver'
 
// 导出数据为表格
export async function exportXLSX(data = [], name = '数据') {
    // 第一步：将json数据转为sheet
    const sheet = XLSX.utils.json_to_sheet(data, {
        // 是否显示表头
        skipHeader: true
        // header: ['id', 'users', 'age', 'address']
    })

    // 第二步：创建一个新的空的 workbook，向其中添加 sheet
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, name)
    const wopts = { bookType: 'xlsx', bookSST: false, type: 'array' }
    const wbout = XLSX.write(wb, wopts)
    
    // 弹出下载表格文件
    saveAs(
        new Blob([wbout], {
            type:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }),
        name + '.xlsx'
    )

    return true
}

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
    if (arguments.length === 0) {
        return null
    }
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'undefined' || time === null || time === 'null') {
        return ''
    } else if (typeof time === 'object') {
        date = time
    } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
            time = parseInt(time)
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
            time = time * 1000
        }
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        // Note: getDay() returns 0 on Sunday
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
    return timeStr
}

// 下载文件
export function downloadFile(obj, name, suffix) {
    const url = window.URL.createObjectURL(new Blob([obj]))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    const fileName = parseTime(new Date()) + '-' + name + '.' + suffix
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
