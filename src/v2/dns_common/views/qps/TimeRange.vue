<template>
  <ants-radio-group
    v-model="activeRange"
    size="small"
    @change="changeTime"
    :disabled="loading"
    class="mr-sm"
  >
    <ants-radio-button
      :label="key"
      v-for="(item, key) in rangeObj"
      :key="key"
      :text="item.label"
    />
  </ants-radio-group>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 当前选择时间范围
      activeRange: '1h',
      rangeObj: {
        '1h': {
          label: '近1小时',
          step: '1m',
          stepVal: 60,
          unit: '分钟'
        },
        '1d': {
          label: '近24小时',
          step: '1h',
          stepVal: 60 * 60,
          unit: '小时'
        },
        '30d': {
          label: '近30天',
          step: '24h',
          stepVal: 60 * 60 * 24,
          unit: '天'
        }
      }
    }
  },
  methods: {
    changeTime(val) {
      this.$emit('change', {
        range: val,
        ...this.rangeObj[val]
      })
    }
  }
}
</script>
