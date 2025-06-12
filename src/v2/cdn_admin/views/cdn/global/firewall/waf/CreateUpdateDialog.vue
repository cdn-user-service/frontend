<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '规则集'"
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
      <ants-form-item label="规则集名称" prop="name">
        <ants-input
          v-model="form.name"
          placeholder="请输入规则集名称"
          />
      </ants-form-item>

      <ants-form-item label="描述信息" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入描述信息"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 10 }"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
const defaultForm = {
  // 添加时 id为 0
  id: 0,
  // 规则集名称
  name: '',
  // 描述信息
  remark: ''
}

export default {
  props: {
    // 键名字符串
    keyStr: String
  },
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
            message: '请输入规则集名称',
            trigger: ['change', 'blur']
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入描述信息',
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
        const { id, name, remark } = this.form
        const data = await this.$parent.saveGlobalAttr({
          [this.keyStr]: [{
            id,
            value: JSON.stringify({
              name,
              remark 
            })
          }]
        })
       
        this.$refs.dialogRef.btnLoading = false
        console.log(data)

        if (!data) return
        this.dialogVisible = false
        this.$parent.getTableData()
        // this.$msg.success(this.title + '规则集成功')
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
