<template>
  <el-date-picker
    v-model="dateSearch"
    type="daterange"
    align="right"
    unlink-panels
    :range-separator="antsT('至')"
    :start-placeholder="antsT('开始日期')"
    :end-placeholder="antsT('结束日期')"
    :picker-options="datePickerOptions"
    size="small"
    @change="choiceDate"
    value-format="yyyy-MM-dd HH:mm:ss"
    style="margin-right:10px;width:260px;"
  >
  </el-date-picker>
</template>

<script>
import { calendarShortcuts } from '@/utils/shortcuts'

export default {
  name: 'AntsSearchDatePicker',
  data() {
    return {
      dateSearch: '', // 搜索日期
      datePickerOptions: {
        shortcuts: calendarShortcuts,
        firstDayOfWeek: 1
      }
      // datePickerOptions: {
      //   shortcuts: [
      //     {
      //       text: '最近一周',
      //       onClick(picker) {
      //         const end = new Date()
      //         const start = new Date()
      //         start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      //         picker.$emit('pick', [start, end])
      //       }
      //     },
      //     {
      //       text: '最近一个月',
      //       onClick(picker) {
      //         const end = new Date()
      //         const start = new Date()
      //         start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      //         picker.$emit('pick', [start, end])
      //       }
      //     },
      //     {
      //       text: '最近三个月',
      //       onClick(picker) {
      //         const end = new Date()
      //         const start = new Date()
      //         start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      //         picker.$emit('pick', [start, end])
      //       }
      //     }
      //   ]
      // }
    }
  },
  methods: {
    /**
     * @description: 时间改变
     * @param {*} val
     */

    choiceDate(val) {
      const { startDate, endData } = this.makeTime(val)
      this.$attrs.queryInfo[this.$attrs.startDateKey || 'startDate'] = startDate
      this.$attrs.queryInfo[this.$attrs.endDataKey || 'endData'] = endData
      this.$attrs.queryInfo[this.$attrs.pagenumKey || 'page'] = 1

      this.$listeners.changeInput()
    },

    /**
     * @description: 构造时间
     * @param {*} val
     */

    makeTime(val) {
      return {
        startDate: val && val[0].slice(0, 10) + ' 00:00:00',
        endData: val && val[1].slice(0, 10) + ' 23:59:59'
        // endData: val && val[1].replace('00:00:00', '23:59:59')
      }
    }
  }
}
</script>
