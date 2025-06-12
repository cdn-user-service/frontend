<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '证书'"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="ants-tips_box mb-xl">
      <span class="el-icon-info"></span>
      注意：只能申请当前系统中存在域名的证书。
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
    >   
      <ants-form-item label="绑定域名" prop="commonName">
        <ants-input v-model="form.commonName" placeholder="请输入绑定域名" />
      </ants-form-item>

      <ants-form-item label="备注信息" prop="remark">
        <ants-input v-model="form.remark" placeholder="请输入备注信息" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateUpdateCertify } from '@/v2/cdn_users/api/cdn/site'

const defaultForm = {
  // 添加时 id为 0
  id: 0,
  // 多个IP地址，以逗号分隔的字符串
  commonName: '',
  // 备注信息
  remark: ''
}

export default {
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        commonName: [
          {
            required: true,
            message: '请输入绑定域名',
            trigger: ['change', 'blur']
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
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = row.id ? '修改' : '添加'

      this.form = {
        ...defaultForm,
        ...row
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doCreateUpdateCertify(this.form)
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.title + '证书成功')
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
