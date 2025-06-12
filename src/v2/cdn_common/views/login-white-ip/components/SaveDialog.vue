<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`${form.id ? '修改' : '添加'}IP登录白名单`"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <ants-form-item prop="ip" label="白名单IP">
        <ants-input v-model="form.ip" placeholder="请输入白名单IP" />
      </ants-form-item>

      <ants-form-item prop="remark" label="备注信息">
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
          maxlength="32"
          show-word-limit
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { loginWhiteIpSave } = require(`@/v2/${PROCESS_NAME}/api/login-white-ip`)

// api
const defaultForm = {
  id: 0,
  ip: '',
  remark: '',
  status: 1
}

export default {
  data() {
    const { isIp } = this.$validator

    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      rules: {
        ip: [
          {
            required: true,
            message: '请输入白名单IP',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp(),
            trigger: 'blur'
          }
        ],
        remark: [
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
    // 对话框显示
    showDialog(row = {}) {
      this.dialogVisible = true
      if (row.id) {
        this.form = {
          ...defaultForm,
          ...row
        }
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await loginWhiteIpSave(this.form)
          if (res.code !== 1) return
          this.dialogVisible = false
          this.$emit('refresh')
          this.$msg.success('保存成功')
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
