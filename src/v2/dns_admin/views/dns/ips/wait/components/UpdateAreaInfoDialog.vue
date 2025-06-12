<template>
  <ants-dialog
    title="修改区域信息"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="110px"
      label-position="top"
    >
      <ants-form-item label="区域信息" prop="info" style="margin-bottom: 40px;">
        <ants-input
          v-model="form.info"
          maxlength="200"
          placeholder="请输入区域信息"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doUpdateAclIpInfo } from '@/v2/dns_admin/api/dns/ips'
const defaultForm = {
  id: null,
  info: ''
}
export default {
  data() {
    return {
      btnLoading: false,
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        info: [
          {
            required: true,
            message: '区域信息不能为空',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 修改对话框显示
     * @param {*} row
     */

    showDialog(row) {
      this.form.id = row.id
      this.form.info = row.info
      this.dialogVisible = true
    },

    /**
     * @description: 修改已审核IP段信息提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doUpdateAclIpInfo(this.form)

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$emit('refresh')
        this.$msg.success('修改IP段区域信息成功')
        this.dialogVisible = false
      })
    },

    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
