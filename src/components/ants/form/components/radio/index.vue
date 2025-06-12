<template>
  <el-radio v-bind="$attrs" v-on="$listeners" class="ants-radio">
    {{ antsT(text) }}
  </el-radio>
</template>

<script>
export default {
  name: 'AntsRadio',
  props: {
    text: [String, Number, Boolean]
  }
}
</script>
