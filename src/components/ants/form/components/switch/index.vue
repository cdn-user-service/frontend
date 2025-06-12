<template>
  <el-switch
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :active-text="antsT(activeText)"
    :inactive-text="antsT(inactiveText)"
    :disabled="$attrs.disabled || $attrs.loading || loading"
    v-loading="$attrs.loading || loading"
    element-loading-spinner="el-icon-loading"
    class="ants-switch-loading"
    v-bind="$attrs"
    v-on="$listeners"
  >
  </el-switch>
</template>

<script>
export default {
  name: 'AntsSwitch',
  props: {
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
    activeText: String,
    inactiveText: String
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {}
}
</script>
