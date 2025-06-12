<template>
  <ants-dialog
    v-model="visible"
    ref="dialogRef"
    :title="title"
    width="1000px"
    @close="close"
    top="5vh"
    :footer="false"
    class="message-dialog"
  >
    <div class="text-ants-text-1">
      <div class="pb-df  border-ants-border-3 -mt-sm">
        <div class="font-bold mb-sm">
          <TitleBorder :title="detail.title" />
        </div>
        <span>发布时间：{{ detail.createtime }}</span>
      </div>

      <div class="ql-container ql-snow">
        <div class="ql-editor">
          <div v-html="detail.content"></div>
        </div>
      </div>
    </div>
  </ants-dialog>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

export default {
  name: 'MessageDialog',
  props: {
    title: {
      type: String,
      default: '消息详情'
    }
  },
  data() {
    return {
      visible: false,
      detail: {}
    }
  },
  methods: {
    show(detail = {}) {
      this.visible = true
      this.detail = detail
    },

    close() {}
  }
}
</script>

<style lang="scss">
.message-dialog {
  .ql-container.ql-snow {
    height: calc(100vh - 350px);
    min-height: 300px;
    border-color: #ebeef5;
    border-radius: 10px;
  }
}
</style>
