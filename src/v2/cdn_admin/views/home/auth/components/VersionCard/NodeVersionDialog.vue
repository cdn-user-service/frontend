<template>
  <ants-dialog
    :title="title"
    v-model="dialogVisible"
    width="700px"
    @close="resetForm"
    @submit="submitForm"
    ref="dialogRef"
  >
    <div>
      <el-tag
        type="primary"
        v-for="(item, key) in detailObj"
        :key="key"
        class="mr-sm my-sm"
      >
        {{ key }} 【版本：{{ item }}】
      </el-tag>
    </div>
    <ants-button
      slot="footer"
      type="info"
      size="small"
      text="关 闭"
      @click="dialogVisible = false"
    />
  </ants-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      detailObj: {},
      title: ''
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     */

    showDialog(detailObj = {}, title = '') {
      this.dialogVisible = true
      this.title = title
      this.detailObj = detailObj
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {},

    // 表单重置
    resetForm() {
        setTimeout(() => {
            this.detailObj = {}
        }, 200)
    }
  }
}
</script>
