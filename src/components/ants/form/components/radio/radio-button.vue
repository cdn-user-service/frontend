<template>
  <el-radio-button v-bind="$attrs" v-on="$listeners" class="ants-radio-button">
    {{ antsT(text) }}
  </el-radio-button>
</template>

<script>
export default {
  name: 'AntsRadioButton',
  props: {
    text: [String, Number, Boolean]
  }
}
</script>
