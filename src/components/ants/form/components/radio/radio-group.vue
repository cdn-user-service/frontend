<template>
  <el-radio-group v-bind="$attrs" v-on="$listeners" class="ants-radio-group">
    <slot></slot>
  </el-radio-group>
</template>

<script>
export default {
  name: 'AntsRadioGroup'
}
</script>
