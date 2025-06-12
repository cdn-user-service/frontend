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
    value-format="timestamp"
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
      time: [new Date(new Date().setHours(0, 0, 0, 0)).getTime(), Date.now()]
    }
  },
  created() {
    // 时间初始化
    const timeArr = this.value.split('-')
    const zeroTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime()

    // 检测为空时
    if (!timeArr[0]) timeArr[0] = 0
    if (!timeArr[1]) timeArr[1] = (Date.now() - zeroTime) / 1000

    console.log(timeArr)
    const startTime = timeArr[0] * 1000 + zeroTime
    const endTime = timeArr[1] * 1000 + zeroTime
    this.time = [startTime, endTime]
  },
  methods: {
    /**
     * @description: 时间范围改变
     * @param {*} val
     */    
    changeTime(val) {
      console.log(val)
      const zeroTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
      const startSecends = (val[0] - zeroTime) / 1000
      const endSecends = (val[1] - zeroTime) / 1000
      const timeStr = `${Math.floor(startSecends)}-${Math.floor(endSecends)}`
      console.log(timeStr)
      this.updateContentInput(timeStr)
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
