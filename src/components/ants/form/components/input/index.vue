<template>
  <el-input
    :class="{ 'ants-input-bgc': isBgc }"
    class="ants-input"
    :placeholder="antsT(placeholder)"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="(index, name) in $slots" :slot="name">
      <slot :name="name" />
    </template>
  </el-input>
</template>

<script>
export default {
  name: 'AntsInput',
  props: {
    placeholder: String,
    // 是否为带背景的输入框
    isBgc: Boolean
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss">
.ants-input-bgc {
  // 用于非控制台的背景色
  .el-input__inner {
    border: 2px solid #f2f6fa;
    background-color: #f2f6fa;
    border-radius: 6px;
    line-height: 56px;
    height: 56px;
    padding-left: 45px;
  }

  .el-textarea__inner {
    border-radius: 6px;
  }

  .el-input__prefix {
    left: 20px;
    top: 2px;
  }

  .el-input__inner:focus {
    border-color: theme('colors.primary');
  }
}
.ants-main-box,
.ants-dialog {
  .ants-input-bgc {
    // 用于控制台的背景色，方便深浅颜色切换
    .el-textarea__inner,
    .el-input__inner {
      border: 2px solid theme('colors.ants-bg-5');
      background-color: theme('colors.ants-bg-5');
    }
    .el-textarea__inner:focus,
    .el-input__inner:focus {
      border-color: theme('colors.primary');
    }
  }
}
</style>
