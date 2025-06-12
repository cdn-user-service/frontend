<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('同意协议配置') }}</strong>
    </div>

    <QuillEditor v-model="agreement" />

    <div class="mt-df">
      <ants-button
        type="primary"
        :loading="btnLoading"
        @click="submitAgreement"
        text="保存配置"
      />
    </div>
  </el-card>
</template>

<script>
import QuillEditor from '@/components/quill-editor.vue'

export default {
  components: {
    QuillEditor
  },
  data() {
    return {
      paramsId: 0,
      params: {
        id: 28,
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
      const { data: res } = await this.$root.getSystemConfigByParamKey(
        this.params.key
      )
      this.paramsId = res.id

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
        id: this.paramsId,
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
