<template>
  <div class="ip-input-box inline-block">
    <div v-for="(item, key) in ipObj" :key="key" class="inline-block">
      <el-input
        :class="`ip-input--${size}`"
        v-model.number="ipObj[key]"
        maxlength="3"
        :ref="`ip${key}Ref`"
        @keyup.native="keyupEvent($event, +key)"
        @input="val => handleInput(val, +key)"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        :size="size"
        :disabled="disabled || disabledArr.indexOf(+key) != -1"
      />
      <span class="dot" v-if="key < 4">.</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IpInput',
  props: {
    // 双向绑定的 ipv4 地址
    value: String,
    // 大小：mini small medium
    size: {
      type: String,
      default: 'small'
    },
    // 禁用所有输入框
    disabled: Boolean,
    // 禁用一些输入框
    disabledArr: {
      type: Array,
      default: () => []
    }
  },
  model: {
    prop: 'value',
    event: 'updateValue'
  },
  data() {
    return {
      ipObj: {
        1: null,
        2: null,
        3: null,
        4: null
      },

      // 当前光标的位置
      selectionStart: 0
    }
  },
  created() {},
  mounted() {
    // 初始化值
    if (typeof this.value === 'string') {
      const arr = this.value.split('.')
      for (let i = 1; i <= 4; i++) {
        this.ipObj[i] = arr[i - 1] || null
      }
    }
  },
  watch: {
    ipObj: {
      handler(newVal, oldVal) {
        const ipArr = []
        Object.keys(newVal).forEach(key => {
          ipArr.push(newVal[key])
        })
        // 更新双向绑定的值
        this.$emit('updateValue', ipArr.join('.'))
      },
      // 其值是true或false；确认是否深入监听
      deep: true,
      // 其值是true或false；确认是否以当前的初始值执行handler的函数。
      immediate: false
    }
  },
  computed: {},
  methods: {
    handleFocus(event) {
      setTimeout(() => {
        this.selectionStart = event.srcElement.selectionStart
      }, 50)
    },
    handleBlur(event) {},

    /**
     * @description: 监听按下键盘，输入框值改变之后才执行
     * @param {*} event
     * @param {*} key
     */
    keyupEvent(event, key) {
      const keyCode = event.keyCode
      // 删除键
      if (keyCode === 8 && key > 1) {
        if (this.ipObj[key] === '') {
          this.$nextTick(() => {
            const inputRef = `ip${key - 1}Ref`
            this.$refs[inputRef] && this.$refs[inputRef][0].focus()
          })
        }
      }

      // 左键
      // if (keyCode === 37 && key > 1) {
      //   const selectionStart = event.srcElement.selectionStart
      //   if (selectionStart === 0) {
      //     this.$nextTick(() => {
      //       const inputRef = `ip${key - 1}Ref`
      //       this.$refs[inputRef] && this.$refs[inputRef][0].focus()
      //     })
      //   }
      // }
      // // 右键
      // if (keyCode === 39 && key < 4) {
      //   const selectionEnd = event.srcElement.selectionEnd
      //   if (selectionEnd >= (this.ipObj[key] + '').length) {
      //     this.$nextTick(() => {
      //       const inputRef = `ip${key + 1}Ref`
      //       this.$refs[inputRef] && this.$refs[inputRef][0].focus()
      //     })
      //   }
      // }

      if (key == 4) return
      /** 按下.键跳到下一个输入框（同理可做出其他按键的跳转输入框）
       *  1、不同键盘键位对应 . 的值 87键->190  104键->110
       *  2、输入长度为 3 时，自动聚焦到下一个输入框
       */
      const inputValueStr = this.ipObj[key] + ''
      if (keyCode === 110 || keyCode === 190 || inputValueStr.length >= 3) {
        this.$nextTick(() => {
          const inputRef = `ip${key + 1}Ref`
          this.$refs[inputRef] && this.$refs[inputRef][0].select()
        })
      }
    },

    /**
     * @description: 仅在输入框失去焦点或用户按下回车时触发
     */

    handleChange(val) {
      // 失去焦点判断值是否输入完整，并向父组件传整个ip值
      // this.$parent.$emit('el.form.change')
    },

    /**
     * @description: 在 Input 值改变时触发
     * @param {*} val
     * @param {*} key
     */

    handleInput(val = 0, key) {
      let newVal = 0
      // 只允许输入数字
      if (typeof val != 'number') {
        newVal = val.replace(/[^\d*]/g, '')
      }
      // 判断输入框的值范围 0 ~ 255
      if (val < 0) {
        newVal = 0
      }
      if (val > 255) {
        newVal = 255
      }

      // 更新值
      this.ipObj[key] = newVal
    }
  }
}
</script>

<style lang="scss">
.ip-input-box {
  border: 1px solid theme('colors.ants-border-1');
  border-radius: 4px;
  background-color: #fff;
  line-height: 1;
  .el-input {
    width: 34px;
  }

  .el-input__inner {
    line-height: 30px;
    height: 30px;
    padding: 0;
    border: none;
    text-align: center;
  }
  .el-input.is-disabled .el-input__inner {
    background-color: #fff;
  }

  .ip-input--mini {
    width: 30px;
    .el-input__inner {
      line-height: 28px;
      height: 28px;
    }
  }
  .ip-input--small {
    width: 34px;
    .el-input__inner {
      line-height: 30px;
      height: 30px;
    }
  }
  .ip-input--medium {
    width: 40px;
    .el-input__inner {
      line-height: 34px;
      height: 34px;
    }
  }
}
</style>

<style scoped lang="scss"></style>
