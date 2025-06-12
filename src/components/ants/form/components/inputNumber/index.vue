<template>
  <el-input-number
    v-model="inputValue"
    class="ants-input-number"
    :placeholder="antsT(placeholder)"
    :min="min"
    @change="changeValue"
    v-bind="$attrs"
    v-on="$listeners"
  >
  </el-input-number>
</template>

<script>
export default {
  name: 'AntsInputNumber',
  props: {
    placeholder: String,
    value: [String, Number],
    min: {
      type: Number,
      default: 1
    }
  },
  model: {
    event: 'updateValue'
  },
  computed: {
    inputValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('updateValue', val)
      }
    }
  },
  methods: {
    changeValue(val) {
      if (!val) {
        this.$nextTick(() => {
          this.$emit('updateValue', this.min)
        })
      }
    }
  }
  
}
</script>

<style lang="scss">
.ants-input-number {
  .el-input-number__decrease,
  .el-input-number__increase {
    background-color: theme('colors.ants-bg-1');
  }
}
</style>
