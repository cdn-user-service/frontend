<template>
  <div class="flex items-center">
    <span
      class="title-border inline-block mr-sm"
      :style="{ 'background-color': color }"
    ></span>
    <strong>{{ antsT(title) }}</strong>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'TitleBorder',
  props: {
    title: {
      type: String,
      default: ''
    },
    // 自定义颜色
    color: String
  }
}
</script>

<style lang="scss" scoped>
.title-border {
  height: 14px;
  width: 4px;
  background-color: theme('colors.primary');
}
</style>
