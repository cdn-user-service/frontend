<template>
  <ants-radio-group v-model="area" size="small" @change="changeArea">
    <ants-radio-button
      v-for="(item, key) in areaObj"
      :key="key"
      :label="key"
      :disabled="$root.loading"
      :text="item"
    />
  </ants-radio-group>
</template>

<script>
const areaObj = {
  china: '全国分布',
  world: '全球分布'
}
export default {
  data() {
    return {
      area: 'china',
      areaObj
    }
  },
  methods: {
    changeArea(val) {
      this.$emit('change', val)
    }
  }
}
</script>
