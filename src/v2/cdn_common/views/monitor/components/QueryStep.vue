<template>
  <ants-radio-group v-model="step" size="small" @change="changeStep">
    <ants-radio-button
      v-for="item in stepList"
      :key="item.label"
      :label="item.label"
      :disabled="
        item.timeArr.indexOf(time) === -1 ||
          (item.label != step && $root.loading)
      "
      :text="item.title"
    />
  </ants-radio-group>
</template>

<script>
const stepList = [
  {
    label: 60,
    title: '1分钟',
    // 近 24 小时
    timeArr: [24]
  },
  {
    label: 300,
    title: '5分钟',
    // 近一周
    timeArr: [168]
  }
]

export default {
  props: {
    // 当前 radio 绑定的值
    value: {
      type: Number,
      default: 60
    },
    // 时间范围，如果允许时间范围数组中，不存在选中的时间范围，则禁用，
    time: {
      type: Number,
      // 默认近 24 小时
      default: 24 
    }
  },
  model: {
    event: 'updateValue'
  },
  computed: {
    step: {
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
      stepList
    }
  },
  methods: {
    changeStep(val) {
      this.$listeners.getChart()
    }
  }
}
</script>
