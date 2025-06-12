<template>
  <div class="query-time-box">
    <ants-radio-group
      v-model="time"
      size="small"
      @change="changeTime"
      :disabled="$root.loading"
    >
      <ants-radio-button
        v-for="item in timeList"
        :key="item.label"
        :label="item.label"
        :disabled="item.label != time && $root.loading"
        :text="item.title"
      />
    </ants-radio-group>

    <el-date-picker
      v-model="timeValue"
      :disabled="$root.loading"
      type="daterange"
      value-format="timestamp"
      unlink-panels
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      size="small"
      prefix-icon="el-icon-date"
      range-separator=" ~ "
      :clearable="false"
      popper-class="query-picker"
      class="hidden-xs-only"
      @change="changeTimePicker"
      :picker-options="pickerMyOptions"
      :default-time="['00:00:00', '23:59:59']"
    >
    </el-date-picker>
  </div>
</template>

<script>
// 用量查询页面
export default {
  props: {
    // 当前 radio 绑定的值
    value: {
      type: Number,
      default: 720
    },
    step: Number
  },
  model: {
    event: 'updateValue'
  },
  computed: {
    time: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('updateValue', val)
      }
    }
  },
  data() {
    return {
      timeList: Object.freeze([
        // {
        //   label: 1,
        //   title: '近1小时'
        // },
        // {
        //   label: 6,
        //   title: '近6小时'
        // },
        {
          label: 24,
          title: '近24小时'
        },
        {
          label: 168,
          title: '近7天'
        },
        {
          label: 720,
          title: '近30天'
        }
      ]),
      timeValue: [
        // 初始时间范围 为 近 7 天
        new Date().setTime(new Date().getTime() - 3600 * 1000 * 168),
        new Date().getTime()
      ],

      pickerMyOptions: {
        // 禁用当前时间之后的时间选项
        disabledDate: nowtime => {
          return (
            nowtime.getTime() >
            new Date(
              new Date(new Date().toLocaleDateString()).getTime() +
                24 * 60 * 60 * 1000 -
                1
            )
          )
        },

        // 自定义快捷键
        shortcuts: [
          {
            text: '上一周',
            onClick(picker) {
              const todayStart = new Date(
                new Date(picker.value[0].toLocaleDateString()).getTime()
              )
              const todayEnd = new Date(
                new Date(picker.value[0].toLocaleDateString()).getTime() +
                  24 * 3600 * 1000 -
                  1
              )

              const start = new Date()
              const end = new Date()
              start.setTime(todayStart - 7 * 24 * 3600 * 1000)
              end.setTime(todayEnd - 24 * 3600 * 1000)

              // 设置选中值
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '下一周',
            onClick: picker => {
              const todayEnd = new Date(
                new Date(picker.value[1].toLocaleDateString()).getTime() +
                  24 * 3600 * 1000 -
                  1
              ).getTime()
              let start = new Date()
              let end = new Date()
              start.setTime(todayEnd + 1)
              end.setTime(todayEnd + 7 * 24 * 3600 * 1000)
              // 如果为最后一周
              if (end >= Date.now()) {
                end = Date.now()
                start = end - 6 * 24 * 3600 * 1000
                // this.$msg.warning('已经是最后一周')
              }

              // 设置选中值
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '上个月',
            onClick(picker) {
              const todayStart = new Date(
                new Date(picker.value[0].toLocaleDateString()).getTime()
              )
              const todayEnd = new Date(
                new Date(picker.value[0].toLocaleDateString()).getTime() +
                  24 * 3600 * 1000 -
                  1
              )

              const start = new Date()
              const end = new Date()
              start.setTime(todayStart - 30 * 24 * 3600 * 1000)
              end.setTime(todayEnd - 24 * 3600 * 1000)

              // 设置选中值
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 时间范围改变
     * @param {*} val
     */

    changeTime(val) {
      const start = new Date()
      if (val == 1 || val == 6) {
        this.timeValue = [
          start.setTime(start.getTime() - 3600 * 1000 * val),
          new Date().getTime()
        ]
      } else {
        this.timeValue = [
          new Date(
            start.setTime(start.getTime() - 3600 * 1000 * (val - 24))
          ).setHours(0, 0, 0, 0),
          new Date().getTime()
        ]
      }

      this.setStep(this.time)
    },

    /**
     * @description: 设置选择的粒度
     */

    setStep(cycle) {
      const stepObj = {
        // 24 小时
        24: 60,
        // 7 天
        168: 300,
        // 30 天
        720: 300
      }
      this.$emit('update:step', stepObj[cycle])

      // 发起请求，绘制图表
      this.$listeners.getChart()
    },

    /**
     * @description: 自选时间范围改变
     */

    changeTimePicker(val) {
      // 查询周期，单位转为分钟
      const cycle = (val[1] - val[0]) / 1000 / 60
      this.time = 0

      // 周期不能超过 14 天
      if (cycle > 90 * 24 * 60) {
        return this.$msg.error(this.antsT('查询周期不能超过90天'))
      }

      // 这里粒度用不上。直接查询
      this.setStep(168)

      // 设置粒度: 周期 < 7 天 step = 60
      // if (cycle > 0 && cycle < 6 * 24 * 60) {
      //   this.setStep(24)
      // }

      // // 设置粒度: 周期 >= 7 天 step = 300
      // if (cycle >= 6 * 24 * 60) {
      //   this.setStep(168)
      // }
    }
  }
}
</script>

<style lang="scss">
.query-time-box {
  .el-date-editor--daterange.el-input__inner {
    width: 260px;
  }
  .ants-radio-button:last-child .el-radio-button__inner {
    border-radius: 0;
    border-right: 0;
  }
  .el-radio-button--small .el-radio-button__inner {
    padding: 9px 20px;
  }
  .el-input__inner {
    border-radius: 0 4px 4px 0;
    vertical-align: middle;
  }
}
</style>
