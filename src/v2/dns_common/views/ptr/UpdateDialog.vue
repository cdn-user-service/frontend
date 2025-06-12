<template>
  <ants-dialog
    title="修改 PTR 网段"
    v-model="dialogVisible"
    width="500px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      label-position="top"
    >
      <ants-form-item label="网段" prop="groupName">
        <ants-input
          v-model="form.groupName"
          placeholder="请输入网段"
          maxlength="50"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doSavePtr } = require(`@/v2/${PROCESS_NAME}/api/dns/ptr`)

const defaultForm = {
  id: 0,
  groupName: '',
  userId: null,
  parentId: 0
}

export default {
  data() {
    const isIp = (rule, value, callback) => {
      const regIpv6 = /^[\da-fA-F:.]{1,39}$/
      const regIpv4 = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){0,3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/

      if (regIpv4.test(value) || regIpv6.test(value)) {
        return callback()
      }
      callback(new Error('网段格式错误'))
    }

    return {
      dialogVisible: false,
      loading: false,

      form: {
        ...defaultForm
      },

      formRules: {
        groupName: [
          {
            required: true,
            message: '请输入网段',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 点击添加，编辑
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.form.id = row.id
      this.form.groupName = row.groupName
      this.form.userId = row.userId
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doSavePtr(this.form)
        this.$refs.dialogRef.btnLoading = false
        if (res.code !== 1) return
        this.$parent.getTableData()
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
