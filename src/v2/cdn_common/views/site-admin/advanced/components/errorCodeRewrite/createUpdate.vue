<template>
  <ants-dialog
    :title="title + '状态码改写'"
    ref="dialogRef"
    v-model="dialogVisible"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="110px"
    >
      <ants-form-item label="状态码" prop="errorCode">
        <ants-input-number
          v-model.trim="form.errorCode"
          placeholder="请输入状态码"
          :min="300"
          :max="600"
        ></ants-input-number>
      </ants-form-item>
      <ants-form-item label="改写状态码" prop="rewriteCode">
        <ants-input-number
          v-model.trim="form.rewriteCode"
          placeholder="请输入改写状态码"
          :min="200"
          :max="600"
        ></ants-input-number>
      </ants-form-item>
      <ants-form-item label="参数" prop="rewriteParam">
        <ants-input
          v-model="form.rewriteParam"
          placeholder="请输入参数"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
const defaultForm = {
  id: 0,
  errorCode: 200,
  rewriteCode: 200,
  rewriteParam: ''
}

export default {
  props: {
    // 是否为批量操作，为批量操作是不需要提交请求
    bulk: Boolean,
    tableData: Array
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      form: { ...defaultForm },
      formRules: {
        errorCode: [
          {
            required: true,
            message: '请输入状态码',
            trigger: ['change', 'blur']
          }
        ],
        rewriteCode: [
          {
            required: true,
            message: '请输入改写状态码',
            trigger: ['change', 'blur']
          }
        ]
        // rewriteParam: [
        //   {
        //     required: true,
        //     message: '请输入参数',
        //     trigger: ['change', 'blur']
        //   }
        // ]
      }
    }
  },
  methods: {
    // 对话框显示
    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = '添加'
      if (row.id) {
        this.title = '编辑'
        this.form = {
          ...row
        }
      }
    },

    // 添加提交
    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (
          this.tableData.some((item) => item.errorCode === this.form.errorCode)
        ) {
          this.$msg.error('状态码已存在')
          return
        }
        if (!valid) return
        this.bulk ? this.submitByData(this.form) : this.submitByApi(this.form)
      })
    },

    // 提交方式一，发起请求
    async submitByApi(postObj = {}) {
      this.$refs.dialogRef.btnLoading = true
      try {
        const res = await this.$listeners.saveSiteAttr({
          error_code_rewrite: [postObj]
        })
        if (!res) return
        this.$listeners.refreshData()
        this.dialogVisible = false
      } finally {
        this.$refs.dialogRef.btnLoading = false
      }
    },

    // 提交方式二，输出数据，用于批量操作
    submitByData(postObj = {}) {
      this.$emit('save', {
        prop: 'error_code_rewrite',
        data: postObj
      })
      this.dialogVisible = false
      this.$msg.success('操作成功')
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
