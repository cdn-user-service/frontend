<template>
  <ants-dialog
    title="添加IP段数据"
    v-model="dialogVisible"
    width="600px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="fromRef"
      label-width="110px"
      label-position="top"
      status-icon
    >
      <ants-form-item label="IP段数据" prop="content">
        <ants-input
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 30 }"
          v-model="form.content"
          placeholder="一行一个IP段数据，例如：
1.1.1.1 2.2.2.2 区域信息"
        ></ants-input>
      </ants-form-item>
      <div class="text-sm text-ants-text-4">
        一行一个，格式：1.1.1.1 2.2.2.2 区域信息
      </div>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { doCreateAclIp } from '@/v2/dns_admin/api/dns/ips'
const defaultForm = {
  content: ''
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
        content: [
          {
            required: true,
            message: 'IP段数据不能为空',
            trigger: ['change', 'blur']
          }
          //   {
          //     validator: checkIpsArr,
          //     trigger: 'blur'
          //   }
        ]
      }
    }
  },
  methods: {
    showDialog(row) {
      this.dialogVisible = true
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.fromRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        // 构造Ip段数据
        // const ips = this.form.content.trim().replace(/[\r\n\s]+/g, ',')
        const { data: res } = await doCreateAclIp({
          txt: this.form.content.trim()
        })
        this.$refs.dialogRef.btnLoading = false
        if (res.code !== 1) return
        this.$emit('refresh')
        this.$msg.success('添加IP段成功')
        this.dialogVisible = false
      })
    },

    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.fromRef.resetFields()
    }
  }
}
</script>
