<template>
  <el-time-picker
    popper-class="rule-time-picker"
    class="rule-time-picker-box"
    style="width:180px;"
    is-range
    size="small"
    range-separator="~"
    :start-placeholder="antsT('开始时间')"
    :end-placeholder="antsT('结束时间')"
    value-format="yyyy-MM-dd HH:mm:ss"
    :clearable="false"
    v-model="time"
    @change="changeTime"
  >
  </el-time-picker>
</template>

<script>
export default {
  props: ['value'],
  model: {
    event: 'updateValue'
  },
  data() {
    return {
      // 选中时间
      time: []
    }
  },
  created() {
    // 时间初始化
    const timeArr = this.value.split('-')
    const nowTimeStr = this.$dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss')
    const todayStr = nowTimeStr.slice(0, 10)
    const todayHms = nowTimeStr.slice(11)

    // 检测为空时
    if (!timeArr[0]) timeArr[0] = '00:00:00'
    if (!timeArr[1]) timeArr[1] = todayHms

    this.time = [`${todayStr} ${timeArr[0]}`, `${todayStr} ${timeArr[1]}`]
    console.log(this.time)
  },
  methods: {
    /**
     * @description: 时间范围改变
     * @param {*} val
     */    
    changeTime(val) {
      const { startStr, endStr } = this.sliceTime(val)
      const timeStr = `${startStr}-${endStr}`
      this.updateContentInput(timeStr)
    },

    /**
     * @description: 分割时间，只取 HH:mm:ss
     * @return {*}
     */    
    sliceTime(timeVal) {
      return {
        startStr: timeVal && timeVal[0].slice(11),
        endStr: timeVal && timeVal[1].slice(11)
      }
    },

    /**
     * @description: 给父组件赋值
     */

    updateContentInput(timeStr) {
      this.$emit('updateValue', timeStr)
    }
  }
}
</script>

<style lang="scss">
.rule-time-picker-box {
  padding-right: 1px;
  .el-input__icon.el-range__close-icon {
    display: none;
  }
}
</style>
