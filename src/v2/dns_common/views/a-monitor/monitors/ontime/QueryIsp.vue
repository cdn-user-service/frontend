<template>
  <ants-radio-group
    size="small"
    @change="onChange"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <ants-radio-button
      :label="key"
      v-for="(item, key) in ispObj"
      :key="key"
      :text="item"
    />
  </ants-radio-group>
</template>

<script>
const ispObj = {
  all: '全部',
  mobile: '移动',
  unicom: '联通',
  telecom: '电信'
}
export default {
  data() {
    return {
      ispObj
    }
  },
  methods: {
    onChange(val) {
      this.$emit('change', {
        value: val,
        name: ispObj[val]
      })
    }
  }
}
</script>
