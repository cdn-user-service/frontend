<template>
  <el-form
    class="ants-form"
    :class="spaceClass"
    ref="form"
    :size="size"
    :label-position="formLabelPosition"
    :status-icon="statusIcon"
    v-bind="$attrs"
    v-on="$listeners"
    @submit.native.prevent
  >
    <slot></slot>
  </el-form>
</template>

<script>
export default {
  name: 'AntsForm',
  props: {
    // 用于控制该表单内组件的尺寸
    size: {
      type: String,
      default: 'medium'
    },
    // 表单域标签的位置，如果值为 left 或者 right 时，则需要设置 label-width
    labelPosition: String,
    // 是否在输入框中显示校验结果反馈图标
    statusIcon: {
      type: Boolean,
      default: true
    },
    // formItem 之间的间距
    spaceClass: {
      type: String,
      default: 'space-y-8'
    }
  },
  computed: {
    formLabelPosition({ $store }) {
      return this.labelPosition || ($store.state.isPhone ? 'top' : 'left')
    }
  },
  data() {
    return {}
  },
  methods: {
    validate(validFun) {
      return this.$refs.form.validate(validFun)
    },

    /**
     * @description: 对部分表单字段进行校验的方法
     */

    validateField(props, callback) {
      return this.$refs.form.validateField(props, callback)
    },

    /**
     * @description: 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
     */

    resetFields() {
      this.$refs.form.resetFields()
    },

    /**
     * @description: 移除表单项的校验结果。传入待移除的表单项的 prop 属性或者 prop 组成的数组，如不传则移除整个表单的校验结果
     */

    clearValidate(props) {
      return this.$refs.form.clearValidate(props)
    }
  }
}
</script>

<style lang="scss">
.ants-form {
  .el-form-item__label {
    font-size: 13px;
    font-weight: 700;
  }
  .el-form-item {
    padding-bottom: 5px;
  }

  @media screen and (max-width: 767px) {
    .el-form-item__label {
      line-height: 24px;
      font-size: 12px;
    }
    .el-form-item {
      padding-bottom: 0;
    }

    .el-radio {
      margin-right: 20px;
    }

    // 小屏幕下 表单不换行样式, 给 <el-form-item>
    .phone-one-line {
      display: flex;
      align-items: center;
    }
  }
}

.lang-en {
  .ants-form {
    .el-form-item__label {
      font-size: 13px;
      font-weight: 400;
    }
  }
}
</style>
