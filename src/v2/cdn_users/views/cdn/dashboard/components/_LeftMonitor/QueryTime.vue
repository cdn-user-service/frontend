<template>
  <ants-radio-group v-model="time" size="small" @change="changeTime">
    <ants-radio-button
      v-for="item in timeList"
      :key="item.label"
      :label="item.label"
      :disabled="item.label != time && $root.loading"
      :text="item.title"
    />
  </ants-radio-group>
</template>
<script>
export default {
  props: {
    // 当前 radio 绑定的值
    value: {
      type: Number,
      default: 24
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
          title: '今日'
        },
        {
          label: 168,
          title: '近7天'
        // },
        // {
        //   label: 720,
        //   title: '近30天'
        }
      ]),
      timeValue: [
        // 初始时间范围 为 近6小时
        new Date().setTime(new Date().getTime() - 3600 * 1000 * 24),
        new Date().getTime()
      ]
    }
  },
  methods: {
    /**
     * @description: 时间范围改变
     * @param {*} val
     */

    changeTime(val) {
      const start = new Date()
      if (val == 24) {
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

      this.setStep()
      this.$emit('getChart')
    },

    /**
     * @description: 设置选择的粒度
     */

    setStep() {
      const stepObj = {
        24: 60,
        168: 300
      }
      this.$emit('update:step', stepObj[this.time])
    }
  }
}
</script>
