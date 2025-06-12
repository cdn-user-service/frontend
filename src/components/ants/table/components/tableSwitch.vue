<template>
  <el-switch
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :disabled="disabled || loading"
    v-loading="loading"
    element-loading-spinner="el-icon-loading"
    class="ants-switch_loading ants-table-switch"
    v-bind="$attrs"
    v-on="$listeners"
  >
  </el-switch>
</template>

<script>
export default {
  name: 'AntsTableSwitch',
  props: {
    // 开启时的颜色
    activeColor: {
      type: String,
      default: '#13ce66'
    },
    // 关闭时的颜色
    inactiveColor: {
      type: String,
      default: '#DCDFE6'
    },
    // 开启时绑定的值
    activeValue: {
      type: [Boolean, String, Number],
      default: 1
    },
    // 关闭时绑定的值
    inactiveValue: {
      type: [Boolean, String, Number],
      default: 0
    },
    disabled: Boolean
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {}
}
</script>

<style lang="scss">
/* 表格中switch开关样式重置 */
.ants-table-switch {
  .el-switch__core {
    width: 34px !important;
    height: 16px;
  }

  .el-switch__core:after {
    height: 12px;
    width: 12px;
  }

  &.is-checked {
    .el-switch__core::after {
      margin-left: -13px;
    }
  }
}
</style>
