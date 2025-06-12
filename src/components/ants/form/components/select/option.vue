<template>
  <el-option
    :label="antsT(label)"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot></slot>
  </el-option>
</template>

<script>
export default {
  name: 'AntsOption',
  props: {
    label: [String, Number]
  }
}
</script>
