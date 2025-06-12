<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :top="top"
    :fullscreen="isFulscreen"
    :class="{ 'is-fullscreen': isFulscreen }"
    :custom-class="customClass + ' ants-dialog'"
    :append-to-body="appendToBody"
    :close-on-click-modal="closeOnClickModal"
    @close="close"
    v-bind="$attrs"
    v-on="$listeners"
    v-dialogDrag
  >
    <span
      v-if="showFullscreen && isPhone"
      class="ants-dialog_right-btn cursor-color"
      @click="handleFullscreen = !handleFullscreen"
    >
      <span
        class="aicon"
        :class="handleFullscreen ? 'icon-quanping3' : 'icon-quanping2'"
      ></span>
      <!-- 在这个地方添加一个插槽 -->
    </span>
    <span class="ants-dialog_right cursor-color">
      <slot name="right-btn"></slot>
    </span>

    <template slot="title">
      <slot name="title">
        <span class="font-semibold" style="font-size: 15px">
          {{ antsT(title) }}
        </span>
      </slot>
    </template>

    <div
      class="ants-dialog_body"
      v-loading="bodyLoading"
      :style="{ 'max-height': bodyMaxHeight }"
    >
      <slot></slot>
    </div>

    <span slot="footer">
      <!-- 可通过 v-slot:footer 自定义底部按钮 -->
      <slot name="footer" v-if="footer">
        <ants-button
          @click="closeDialog"
          type="info"
          size="small"
          :text="cancelBtnText"
        />
        <ants-button
          type="primary"
          size="small"
          :disabled="btnLoading || bodyLoading"
          :loading="btnLoading"
          @click="submitDialog"
          :text="submitBtnText"
        />
      </slot>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'AntsDialog',
  props: {
    // 弹窗显示隐藏
    value: {
      type: Boolean,
      default: false
    },
    // 弹窗标题
    title: {
      type: String,
      default: ''
    },
    // Dialog 的自定义类名
    customClass: {
      type: String,
      default: ''
    },
    // margin-top 的值
    top: {
      type: String,
      default: '15vh'
    },
    // Dialog 自身是否插入至 body 元素上
    appendToBody: {
      type: Boolean,
      default: true
    },
    // 是否可点击遮盖层关闭
    closeOnClickModal: {
      type: Boolean,
      default: false
    },
    // 是否显示全屏按钮
    showFullscreen: {
      type: Boolean,
      default: true
    },
    // 最大高度，超过会有滚动条
    maxHeight: {
      type: String,
      default: ''
    },
    // 确定按钮文字
    submitBtnText: {
      type: String,
      default: '确 定'
    },
    // 取消按钮文字
    cancelBtnText: {
      type: String,
      default: '取 消'
    },
    fullscreen: Boolean,
    footer: {
      type: Boolean,
      default: true
    }
  },
  model: {
    event: 'updateValue'
  },
  computed: {
    dialogVisible: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('updateValue', val)
      }
    },
    isFulscreen() {
      return (
        this.fullscreen ||
        (this.showFullscreen &&
          this.handleFullscreen &&
          document.body.clientWidth > 768)
      )
    },
    bodyMaxHeight() {
      if (this.maxHeight) return this.maxHeight
      // if (this.isFulscreen && !this.footer) return 'calc(100vh - 120px)'
      if (this.isFulscreen) return 'calc(100vh - 130px)'
      return `calc(100vh - ${this.top} - 180px)`
    }
  },
  data() {
    return {
      // 按钮加载
      btnLoading: false,
      // 对话框body 加载
      bodyLoading: false,
      // 是否为全屏
      handleFullscreen: false,
      isPhone: document.body.clientWidth > 768
    }
  },
  methods: {
    /**
     * @description: 对话框提交
     */

    submitDialog() {
      this.$emit('submit')
    },

    /**
     * @description: 对话框关闭
     */

    closeDialog() {
      this.$emit('updateValue', false)
    },

    /**
     * @description: Dialog 关闭的回调
     */

    close() {
      this.btnLoading = false
      this.bodyLoading = false
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
.ants-dialog {
  max-width: 100vw;
  .el-dialog__header {
    padding: 15px 20px;
    border-bottom: 1px solid theme('colors.ants-border-4');
  }
  .el-dialog__footer {
    padding: 15px 20px;
    text-align: center;
    border-top: 1px solid theme('colors.ants-border-4');
  }

  .el-dialog__body {
    padding: 0 !important;
  }

  .ants-dialog_right-btn {
    position: absolute;
    top: 18px;
    right: 66px;
    > span {
      font-size: 18px;
    }
    &:hover {
      > span {
        font-weight: 700;
      }
    }
  }

  .ants-dialog_right {
    position: absolute;
    top: 20px;
    right: 90px;
    > span {
      font-size: 14px;
    }
    &:hover {
      > span {
        font-weight: 700;
      }
    }
  }
  .el-dialog__headerbtn {
    top: 15px;
    height: 25px;
    width: 25px;
    background-color: theme('colors.ants-bg-3');
    border-radius: 6px;
    .el-icon-close {
      transition: all 0.3s;
    }
    &:hover {
      .el-icon-close {
        transform: rotateZ(90deg);
        color: theme('colors.error');
      }
    }
  }

  .ants-dialog_body {
    padding: 30px;
    // max-height: calc(85vh - 170px);
    overflow-y: auto;
    @media screen and (max-width: 767px) {
      padding: 15px;
    }
  }
}

.is-fullscreen.ants-dialog {
  padding-bottom: 65px;
  .el-dialog__footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
