<template>
  <ants-dialog
    title="自定义HTML"
    ref="dialogRef"
    v-model="dialogVisible"
    width="1200px"
    top="5vh"
    @close="resetForm"
  >
    <div v-html="htmlStr" style="min-height:400px;"></div>
    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        @click="dialogVisible = false"
        text="关 闭"
      />
    </template>
  </ants-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      htmlStr: ''
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     * @param {*} html
     */

    showDialog(html = '') {
      this.dialogVisible = true
      this.htmlStr = html
    },

    // 表单重置
    resetForm() {
      // this.htmlStr = ''
    }
  }
}
</script>
