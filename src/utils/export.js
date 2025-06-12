import XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// 1、导出为xlsx文件
export async function exportXlsx(data, fileName = '表格文件.xlsx') {
  // 创建一个新的空的 workbook
  const wb = XLSX.utils.book_new()
  // sheet 名称
  const sheetName = [fileName]
  sheetName.map((item, idx) => {
    // 将json数据转为sheet
    const sheet = XLSX.utils.json_to_sheet(data, {
      // header: ['id', 'users', 'age', 'address'],
      skipHeader: true // 是否显示表头
    })
    XLSX.utils.book_append_sheet(wb, sheet, item)
  })
  const wopts = { bookType: 'xlsx', bookSST: false, type: 'array' }
  const wbout = XLSX.write(wb, wopts)

  saveAs(
    new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }),
    fileName + '.xlsx'
  )
  return true
}

// 2、导出为 txt 文件
export async function exportTxt(data, fileName = 'TXT文件', toJson = true) {
  const dataStr = toJson ? JSON.stringify(data) : data
  const TXT_BLOB = new Blob([dataStr], {
    type: 'text/plain;charset=utf-8'
  })
  saveAs(TXT_BLOB, fileName + '.txt')
  return true
}
