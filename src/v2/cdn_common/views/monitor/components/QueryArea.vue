<template>
  <ants-radio-group v-model="area" size="small" @change="changeArea">
    <ants-radio-button
      v-for="item in areaList"
      :key="item.label"
      :label="item.label"
      :disabled="item.label != area && $root.loading"
      :text="item.title"
      />
  </ants-radio-group>
</template>

<script>
export default {
  data() {
    return {
      area: 'province',
      areaList: Object.freeze([
        {
          label: 'province',
          title: '全国分布'
        },
        {
          label: 'country',
          title: '全球分布'
        }
      ])
    }
  },
  methods: {
    changeArea(val) {
      this.$listeners.getChart()
    }
  }
}
</script>
