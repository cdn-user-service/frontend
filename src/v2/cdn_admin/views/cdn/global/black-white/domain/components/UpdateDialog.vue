<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`修改${activeTitle}`"
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
      <ants-form-item :label="`${activeTitle}域名`" prop="host">
        <ants-input
          v-model="form.host"
          :placeholder="`请输入${activeTitle}域名`"
        />
      </ants-form-item>

      <ants-form-item label="备注信息" prop="remark">
        <ants-input v-model="form.remark" placeholder="请输入备注信息" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
const defaultForm = {
  id: 0,
  // 单个域名地址
  host: '',
  // 备注信息
  remark: ''
}

export default {
  props: {
    // 键名字符串
    keyStr: [String, Number],
    activeTitle: {
      type: String,
      default: '白名单'
    }
  },
  data() {
    const { isDomain } = this.$validator

    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        host: [
          {
            required: true,
            message: `请输入${this.activeTitle}域名`,
            trigger: ['change', 'blur']
          },
          {
            validator: isDomain(),
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
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.form = {
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
        const { id, remark, host } = this.form
        const data = await this.$parent.saveGlobalAttr({
          [this.keyStr]: [
            {
              id,
              value: JSON.stringify({
                remark,
                host
              })
            }
          ]
        })

        this.$refs.dialogRef.btnLoading = false
        if (!data) return
        this.dialogVisible = false
        this.$parent.getTableData()
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
