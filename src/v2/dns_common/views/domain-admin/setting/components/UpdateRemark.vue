<template>
  <el-dialog
    title="修改域名备注"
    :visible.sync="dialogVisible"
    width="450px"
    center
    :close-on-click-modal="false"
    append-to-body
  >
    <ants-form
      :model="form"
      :rules="rules"
      label-positon="top"
      ref="formRef"
    >
      <ants-form-item prop="remarks">
        <ants-input
          v-model="form.remarks"
          placeholder="请输入域名备注信息"
          :maxlength="200"
          show-word-limit
          type="textarea"
          :rows="4"
        />
      </ants-form-item>
    </ants-form>

    <template slot="footer">
      <ants-button
        type="info"
        @click="dialogVisible = false"
        size="small"
        text="取 消"
      />
      <ants-button
        type="primary"
        @click="doUpdate()"
        size="small"
        text="确 定"
        :loading="loading"
      />
    </template>
  </el-dialog>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doUpdateDomainAttr } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

const defaultForm = {
  // 域名ID
  id: '',
  // 备注信息
  remarks: ''
}
export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,
      form: {
        ...defaultForm
      },
      rules: {
        remarks: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    show(row = {}) {
      this.dialogVisible = true
      this.loading = false
      this.form.id = row.id
      this.form.remarks = row.remarks
    },

    doUpdate() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        const { id, remarks } = this.form
        this.loading = true
        try {
          const { data: res } = await doUpdateDomainAttr({ id, remarks })
          if (res.code !== 1) return
          this.$msg.success('修改成功')
          this.$emit('refresh')
          this.dialogVisible = false
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>
