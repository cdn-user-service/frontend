<template>
  <!-- <ants-button
      @click="downloadData"
      :disabled="$root.loading"
      :loading="loading"
      type="text"
      size="small"
      text="下载"
      icon="el-icon-download"
    /> -->
  <el-tooltip content="下载为表格" effect="light" placement="top">
    <span
      @click="downloadData"
      class="el-icon-download cursor-color py-xs px-xs text-sm"
      >{{ antsT('下载') }}</span
    >
  </el-tooltip>
</template>

<script>
import XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default {
  data() {
    return {
      loading: false,
      // 查询数据
      queryObj: {}
    }
  },
  methods: {
    /**
     * @description: 下载数据
     */

    downloadData() {
      if (!this.queryObj.serialNumber) return this.$msg.error('请先查询数据')
      this.$emit('getSeriesData')
      this.loading = true
    },

    /**
     * @description: 构造要导出的表格数据
     */

    biuldData(seriesObj = {}) {
      // 指定要导出的每列数据
      const jsonArr = seriesObj.data.map(item => {
        return {
          time: this.$dayjs(item[0]).format('YYYY-MM-DD HH:mm:ss'),
          value: `${item[1]} ${seriesObj.id}`
        }
      })

      // 追加表头
      jsonArr.unshift({
        time: '时间',
        value: seriesObj.name
      })

      this.exportLog(jsonArr, seriesObj.name)
    },

    /**
     * @description: 将 json 数据转为 sheet，并导出
     * @return {*}
     */

    exportLog(jsonArr = [], name = '') {
      // 第一步：将json数据转为sheet
      const sheet = XLSX.utils.json_to_sheet(jsonArr, {
        // 是否显示表头
        skipHeader: true
        // header: ['id', 'users', 'age', 'address']
      })

      // 构造名称
      const { start, end, serialNumber } = this.queryObj
      const startDate = this.$dayjs(start).format('YYYY-MM-DD')
      const endData = this.$dayjs(end).format('YYYY-MM-DD')
      const xName = `${startDate}至${endData} 套餐${name}`

      // 第二步：创建一个新的空的 workbook，向其中添加 sheet
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, sheet, xName)
      const wopts = { bookType: 'xlsx', bookSST: false, type: 'array' }
      const wbout = XLSX.write(wb, wopts)

      // 弹出下载表格文件
      saveAs(
        new Blob([wbout], {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }),
        xName + '.xlsx'
      )

      setTimeout(() => {
        this.$msg.success('导出成功')
        this.loading = false
      }, 1000)
    }
  }
}
</script>
