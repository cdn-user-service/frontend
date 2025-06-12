<template>
  <el-checkbox-button  
    v-bind="$attrs"
    v-on="$listeners"
    class="ants-checkbox-button"
  >
  {{antsT(text)}}
  </el-checkbox-button>
</template>

<script>
export default {
  name: 'AntsCheckboxGroup',
  props: {
    text: [String, Number, Boolean]
  }
}
</script>
