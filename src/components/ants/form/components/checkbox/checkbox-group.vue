<template>
  <el-checkbox-group
    v-bind="$attrs"
    v-on="$listeners"
    class="ants-checkbox-group"
  >
    <slot></slot>
  </el-checkbox-group>
</template>

<script>
export default {
  name: 'AntsCheckboxGroup'
}
</script>
