<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('同意协议配置') }}</strong>
    </div>

    <QuillEditor v-model="agreement" />

    <div class="mt-sm">
      <el-button
        size="small"
        type="primary"
        :loading="btnLoading"
        @click="submitAgreement"
        icon="el-icon-check"
        >保存配置</el-button
      >
    </div>
  </el-card>
</template>

<script>
// 组件
import QuillEditor from '@/components/quill-editor.vue'

export default {
  components: {
    QuillEditor
  },
  data() {
    return {
      params: {
        id: 20,
        key: 'WEB_AGREEMENT',
        remark: '同意协议'
      },

      btnLoading: false,
      agreement: ''
    }
  },
  created() {
    this.getData()
  },

  methods: {
    /**
     * @description: 获取数据
     */

    async getData() {
      // const { data: res } = await this.$root.getSystemConfigById(
      //   this.params.id
      // )

      const { data: res } = await this.$root.getSystemConfigByKey(
        this.params.key
      )
      this.agreement = res.agreement || ''
    },

    /**
     * @description: 提交数据
     */

    async submitAgreement() {
      if (!this.agreement) return this.$msg.error('请输入同意协议内容！')
      this.btnLoading = true

      const paramValueJSON = JSON.stringify({
        agreement: this.agreement
      })

      const { data: res } = await this.$root.updateSystemConfig({
        id: this.params.id,
        paramKey: this.params.key,
        remark: this.params.remark,
        paramValue: paramValueJSON
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.$msg.success('保存配置成功')
    }
  }
}
</script>
