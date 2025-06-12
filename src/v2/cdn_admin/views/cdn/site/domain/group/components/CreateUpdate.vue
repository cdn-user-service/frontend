<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '分组'"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="60px"
    >
      <ants-form-item prop="name" label="名称">
        <ants-input
          v-model="form.name"
          placeholder="请输入分组名称"
          maxlength="200"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="info" label="备注">
        <ants-input
          v-model="form.info"
          placeholder="请输入备注信息"
          maxlength="1000"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
const defaultForm = {
  id: 0,
  name: '',
  info: 3
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
        name: [
          {
            required: true,
            message: '请输入分组名称',
            trigger: ['change', 'blur']
          }
        ],
        info: [
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
      this.title = '添加'
      if (row.id) {
        this.title = '修改'
        this.form = {
          ...this.form,
          ...row
        }
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        // this.$refs.dialogRef.btnLoading = true
        // const { data } = await doCreateSite(this.form)
        // this.$refs.dialogRef.btnLoading = false

        // if (data.code !== 1) return
        // this.dialogVisible = false
        // this.$parent.getTableData()
        this.$msg.success(this.title + '分组成功')
      })
    },

    // 表单重置
    resetForm() {
      this.form = defaultForm
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
