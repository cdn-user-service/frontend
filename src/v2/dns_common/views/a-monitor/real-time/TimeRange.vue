<template>
  <ants-radio-group
    size="small"
    @change="onChange"
    v-bind="$attrs"
    v-on="$listeners"
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
const rangeObj = {
  '1h': {
    label: '近1小时',
    step: '1m',
    stepVal: 60,
    unit: '分钟'
  },
  '6h': {
    label: '近6小时',
    step: '5m',
    stepVal: 60,
    unit: '小时'
  },
  '1d': {
    label: '近24小时',
    step: '1h',
    stepVal: 60 * 60,
    unit: '小时'
  },
  '7d': {
    label: '近7天',
    step: '1h',
    stepVal: 60 * 60,
    unit: '天'
  // },
  // '30d': {
  //   label: '近30天',
  //   step: '24h',
  //   stepVal: 60 * 60 * 24,
  //   unit: '天'
  }
}
export default {
  data() {
    return {
      rangeObj
    }
  },
  methods: {
    onChange(val) {
      this.$emit('change', {
        range: val,
        ...this.rangeObj[val]
      })
    }
  }
}
</script>
