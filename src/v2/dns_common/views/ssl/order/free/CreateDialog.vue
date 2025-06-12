<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`申请证书`"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
    >
      <ants-form-item
        label="证书期限"
        prop="certificate_validity_days"
        v-if="$mode['176_179']"
      >
        <ants-radio-group v-model="form.certificate_validity_days">
          <ants-radio :label="90" text="90天" />
          <ants-radio :label="365" text="365天" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item label="绑定域名" prop="domains">
        <ants-input
          v-model="form.domains"
          type="textarea"
          :autosize="{ minRows: 8, maxRows: 16 }"
          placeholder="输入绑定域名，每行一个，最多可输入1000个域名。例如：
domain1.com
domain2.com"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doCreateCert } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const defaultForm = {
  // 有效期： 90 | 365 天
  certificate_validity_days: 90,
  // 多个域名以逗号分隔
  domains: '',
  // 可不用传
  userId: 0
}

export default {
  data() {
    const { isDomains } = this.$validator
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        domains: [
          {
            required: true,
            message: '请输入域名',
            trigger: ['change', 'blur']
          },
          {
            validator: isDomains(),
            trigger: 'blur'
          }
        ],
        certificate_validity_days: [
          {
            required: true,
            message: '请选择证书期限',
            trigger: ['change', 'blur']
          }
        ]
      },

      loading: false
    }
  },
  methods: {
    show(row = {}) {
      this.dialogVisible = true
    },

    // 表单提交
    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { domains } = this.form

          const { data: res } = await doCreateCert({
            // 有效期： 90 | 365 天
            certificate_validity_days: this.$mode['176_179']
              ? this.form.certificate_validity_days
              : 90,
            // 多个域名以逗号分隔
            domains: domains.trim().replace(/[\r\n]+/g, ','),
            // 可不用传
            userId: 0
          })
          if (res.code !== 1) return
          this.dialogVisible = false
          this.$emit('refresh')
          this.$msg.success(this.antsT('证书申请已提交'))
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
