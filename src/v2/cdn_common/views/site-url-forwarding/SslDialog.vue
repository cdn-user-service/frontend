<template>
  <el-dialog
    :title="`配置证书${form.notAfter ? `（有效期至${form.notAfter}）` : ''}`"
    :visible.sync="dialogVisible"
    width="700px"
    :close="handleClose"
    :close-on-click-modal="false"
    append-to-body
    center
  >
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="90px"
      space-class="space-y-6"
    >
      <ants-form-item
        label="SSL_PEM"
        prop="certStr"
      >
        <ants-input
          v-model="form.certStr"
          placeholder="PEM编码"
          type="textarea"
          :rows="8"
        />
      </ants-form-item>
      <ants-form-item
        label="SSL_KEY"
        prop="keyStr"
      >
        <ants-input
          v-model="form.keyStr"
          placeholder="密钥KEY"
          type="textarea"
          :rows="8"
        />
      </ants-form-item>
    </ants-form>
    <div
      slot="footer"
      class="-mt-lg"
    >
      <el-button
        @click="dialogVisible = false"
        type="info"
        size="small"
        icon="el-icon-close"
      >取 消</el-button>
      <el-button
        type="primary"
        @click="doSave()"
        size="small"
        icon="el-icon-check"
      >保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
const defaultForm = {
  // 证书
  certStr: '',
  keyStr: '',
  // 证书有效期
  notAfter: null
}

const rules = {
  certStr: [
    { required: true, message: '请输入SSL_PEM', trigger: ['blur'] }
  ],
  keyStr: [
    { required: true, message: '请输入SSL_KEY', trigger: ['blur'] }
  ]
}
export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      rules
    }
  },
  methods: {
    show(sslObj = {}) {
      this.form = {
        ...defaultForm,
        ...sslObj
      }
      this.dialogVisible = true
    },

    doSave() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        this.$emit('submit', this.form)
        this.dialogVisible = false
        this.$msg.success('保存成功')
      })
    },

    handleClose() {}
  }
}
</script>
