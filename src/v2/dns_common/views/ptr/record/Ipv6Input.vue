<template>
  <div class="ipv6-input-box flex items-center" @click="handleClick">
    <span
      style="font-size: 13px;"
      class="text-ants-text-6 cursor-not-allowed inline-block h-full pl-2 leading-10"
    >
      {{ disabledStr }}
    </span>
    <div class="flex-1">
      <el-input
        :class="`ip-input--${size}`"
        v-model.trim="ipv6"
        maxlength="39"
        ref="ipRef"
        @keyup.native="keyupEvent"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        :size="size"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Ipv6Input',
  props: {
    // 双向绑定的 ipv4 地址
    value: String,
    // 大小：mini small medium
    size: {
      type: String,
      default: 'small'
    },
    // 需要禁用的字段
    disabledStr: [String, Number],
    // 是否禁用输入框
    disabled: Boolean
  },
  model: {
    prop: 'value',
    event: 'updateValue'
  },
  data() {
    return {
      ipv6: ''
    }
  },
  created() {},
  mounted() {
    // 初始化值
    if (typeof this.value === 'string') {
      this.ipv6 = this.value.replace(this.disabledStr, '')
    }
  },
  watch: {
    ipv6: {
      handler(newVal, oldVal) {
        // 更新双向绑定的值
        this.$emit('updateValue', this.disabledStr + newVal)
      },
      // 其值是true或false；确认是否深入监听
      deep: false,
      // 其值是true或false；确认是否以当前的初始值执行handler的函数。
      immediate: false
    }
  },
  computed: {},
  methods: {
    handleFocus(event) {},

    handleBlur(event) {},

    handleClick() {
      this.$refs.ipRef.focus()
    },

    /**
     * @description: 监听按下键盘，输入框值改变之后才执行
     * @param {*} event
     * @param {*} key
     */
    keyupEvent(event) {},

    /**
     * @description: 仅在输入框失去焦点或用户按下回车时触发
     */

    handleChange(val) {
      // 失去焦点判断值是否输入完整，并向父组件传整个ip值
    },

    /**
     * @description: 在 Input 值改变时触发
     * @param {*} val
     * @param {*} key
     */

    handleInput(val = 0) {
      this.ipv6 = val.replace(/[^\da-fA-F:.]/g, '')
    }
  }
}
</script>

<style lang="scss">
.ipv6-input-box {
  border: 1px solid theme('colors.ants-border-1');
  border-radius: 4px;
  background-color: #fff;
  line-height: 1;
  width: 290px;
  .el-input {
    min-width: 80px;
    font-size: 13px;
  }

  .el-input__inner {
    line-height: 30px;
    height: 30px;
    padding: 0 5px 0 0;
    border: none;
  }
  .el-input.is-disabled .el-input__inner {
    background-color: #fff;
  }

  .ip-input--mini {
    min-width: 50px;
    .el-input__inner {
      line-height: 28px;
      height: 28px;
    }
  }
  .ip-input--small {
    min-width: 80px;
    .el-input__inner {
      line-height: 30px;
      height: 30px;
    }
  }
  .ip-input--medium {
    min-width: 100px;
    .el-input__inner {
      line-height: 34px;
      height: 34px;
    }
  }
}
</style>
