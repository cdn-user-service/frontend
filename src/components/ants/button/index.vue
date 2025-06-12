<template>
  <el-button class="ants-button" v-bind="$attrs" @click.prevent="handleClick"
    >{{ antsT(text) }}<slot />
  </el-button>
</template>

<script>
// 导入防抖插件
// import { debounce } from 'throttle-debounce'

export default {
  name: 'AntsButton',
  props: {
    text: [String, Number]
  },
  methods: {
    handleClick() {
      this.$emit('click')
      // debounce(500, () => {
      //   this.$emit('click', {})
      // })
    }
  }
}
</script>
