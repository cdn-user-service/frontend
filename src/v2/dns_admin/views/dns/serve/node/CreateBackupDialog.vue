<template>
  <ants-dialog
    v-model="dialogVisible"
    title="添加备用IP"
    width="550px"
    ref="dialogRef"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="font-bold mb-sm text-center">
      <el-tag size="small" type="primary">主IP：{{form.parentIp}}</el-tag>
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      label-position="top"
    >
      <ants-form-item label="请输入备用IP，一行一个" prop="ips">
        <ants-input
          v-model="form.ips"
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 20 }"
          placeholder="请输入备用IP，一行一个"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doBatchCreateBackupNode } from '@/v2/dns_admin/api/dns/serve'

const defaultForm = {
  // 该 id 为主IP的id
  parentId: null,
  // 主IP
  parentIp: '',
  // 备用ip，多个用 逗号分隔
  ips: ''
}
export default {
  data() {
    const { isIps } = this.$validator
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        ips: [
          {
            required: true,
            message: '请输入备用IP，一行一个',
            trigger: ['change', 'blur']
          },
          {
            validator: isIps(),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     */

    show({ id, ip }) {
      this.dialogVisible = true
      this.form = {
        ...defaultForm,
        parentId: id,
        parentIp: ip
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const { data } = await doBatchCreateBackupNode({
          ...this.form,
          ips: this.form.ips.trim().replace(/[\r\n]+/g, ',')
        })
        this.$refs.dialogRef.btnLoading = false

        if (data.code !== 1) return
        this.dialogVisible = false
        this.$emit('refresh')
        this.$msg.success('添加备用IP成功')
      })
    },

    // 添加DNS表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
