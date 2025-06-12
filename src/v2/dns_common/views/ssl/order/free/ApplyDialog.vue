<template>
  <ants-dialog
    title="申请免费证书"
    width="600px"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
  >
    <div class="ants-tips_box">
      <span class="el-icon-info"></span>
      若所绑定的域名未在本系统解析，您需要前往域名所在DNS服务商，添加对应的TXT记录。
    </div>

    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="90px"
      label-position="top"
    >
      <ants-form-item label="证书绑定域名" prop="domains">
        <div class="relative">
          <ants-input
            v-model="form.domains"
            type="textarea"
            rows="8"
            :placeholder="
              `请输入绑定域名，每行一个，最多可输入 1000 个域名。例如：
  www.domain1.com
  www.domain2.com`
            "
          />
          <span
            class="absolute bottom-0 right-0 text-sm text-ants-text-3 pr-xs"
          >
            已输入(<span
              :class="domainRows > 1000 ? 'text-error' : 'text-primary'"
              >{{ domainRows }}</span
            >)行
          </span>
        </div>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME
const { applyFreeSsl } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const defaultForm = {
  domains: ''
}

export default {
  props: {},
  data() {
    const rules = {
      domains: [
        {
          required: true,
          message: '请输入证书绑定域名',
          trigger: ['blur', 'change']
        }
      ]
    }

    return {
      btnLoading: false,
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      rules
    }
  },
  computed: {
    // 已输入多少行域名
    domainRows() {
      if (this.form.domains === '') return 0
      return this.form.domains.trim().split(/[\r\n]+/).length
    }
  },
  methods: {
    // 对话框显示
    show() {
      this.dialogVisible = true
      this.form.domains = ''
    },

    // 表单提交
    submit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await applyFreeSsl({
            domains: this.form.domains.trim().replace(/[\r\n]+/g, ',')
          })
          if (res.code !== 1) return
          this.$emit('refresh')
          this.dialogVisible = false
          this.$msg.success('申请成功')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 对话框关闭
    closed() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
