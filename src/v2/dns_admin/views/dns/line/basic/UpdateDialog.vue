<template>
  <ants-dialog
    title="修改数据"
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
      label-width="100px"
      label-position="top"
    >
      <ants-form-item label="区域名称" prop="name">
        <ants-input
          v-model="form.name"
          placeholder="请输入区域名称"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="区域编码" prop="code">
        <ants-input
          v-model="form.code"
          placeholder="请输入区域编码"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
const defaultForm = {
  id: '',
  name: '',
  code: ''
}
export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        name: [
          {
            required: true,
            message: '区域名称不能为空',
            trigger: 'blur'
          }
        ],
        code: [
          {
            required: true,
            message: '区域编码不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    showDialog(row = {}) {
      this.dialogVisible = true
      this.form = {
        ...this.form,
        ...row
      }
    },

    /**
     * @description: 添加提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        // this.$refs.dialogRef.btnLoading = true
        // const { data: res } = await aaaa(this.form)
        // this.$refs.dialogRef.btnLoading = false
        // if (res.code !== 1) return
        // this.$parent.getGoodsList()
        this.$msg.success('修改成功')
        this.dialogVisible = false
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
