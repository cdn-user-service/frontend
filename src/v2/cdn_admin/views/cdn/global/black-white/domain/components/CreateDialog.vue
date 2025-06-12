<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`添加${activeTitle}`"
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
          :placeholder="`请输入${activeTitle}域名，一行一个域名`"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 15 }"
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
  // 添加时 id为 0
  id: 0,
  // 多个域名地址，以逗号分隔的字符串
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
    const { isDomains } = this.$validator

    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        host: [
          {
            required: true,
            message: `请输入${this.activeTitle}域名，一行一个域名`,
            trigger: ['change', 'blur']
          },
          {
            validator: isDomains(),
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

    showDialog(row) {
      this.dialogVisible = true
      this.form = {
        ...defaultForm
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
        const baseArr = host.trim().split(/[\r\n]+/)

        // 去除每一项的空格，并构造数据
        const arr = baseArr.map(item => {
          item.trim()
          return {
            id,
            value: JSON.stringify({
              remark,
              // host: host.trim().replace(/[\r\n\s]+/g, ',')
              host: item.trim()
            })
          }
        })
        
        const data = await this.$parent.saveGlobalAttr({
          [this.keyStr]: arr
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
