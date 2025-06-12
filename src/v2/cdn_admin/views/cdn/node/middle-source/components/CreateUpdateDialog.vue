<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '中间源'"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
  >
    <!-- <div class="ants-tips_box mb-xl">
      <span class="el-icon-info"></span>
      注意：只能申请当前系统中存在域名的中间源。
    </div> -->
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
    >   
      <ants-form-item label="中间源IP" prop="ip">
        <ants-input v-model="form.ip" placeholder="请输入中间源IP" />
      </ants-form-item>

      <ants-form-item label="备注信息" prop="remark">
        <ants-input v-model="form.remark" placeholder="请输入备注信息" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
// import { doCreateUpdateCertify } from '@/v2/cdn_admin/api/cdn/site'

const defaultForm = {
  // 添加时 id为 0
  id: 0,
  // 中间源IP
  ip: '',
  // 备注信息
  remark: ''
}

export default {
  data() {
    const { isIp } = this.$validator
    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        ip: [
          {
            required: true,
            message: '请输入中间源IP',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp(),
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
        // const { data: res } = await doCreateUpdateCertify(this.form)
        // this.$refs.dialogRef.btnLoading = false

        // if (res.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.title + '中间源成功')
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
