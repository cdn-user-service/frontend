<template>
  <el-checkbox  
    v-bind="$attrs"
    v-on="$listeners"
    class="ants-checkbox"
  >
  {{antsT(text)}}
  </el-checkbox>
</template>

<script>
export default {
  name: 'AntsCheckbox',
  props: {
    text: [String, Number, Boolean]
  }
}
</script>
