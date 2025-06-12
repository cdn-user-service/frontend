<template>
  <ants-dialog
    title="修改线路"
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
      <ants-form-item label="线路名称" prop="name">
        <ants-input
          v-model="form.name"
          maxlength="30"
          placeholder="请输入线路名称"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="排序" prop="order">
        <ants-input
          v-model="form.order"
          type="number"
          maxlength="3"
          placeholder="请输入排序"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { doUpdateLine } from '@/v2/dns_admin/api/dns/line'

const defaultForm = {
  id: '',
  name: '',
  order: ''
}
export default {
  props: {
    parentList: Array,
    queryInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    // 验证排序为整数
    const checkCode = (rule, value, callback) => {
      const regCode = /^[0-9]{1,2}$/
      if (!regCode.test(value)) {
        callback(new Error('排序必须为不超过2位数的整数'))
      } else {
        return callback()
      }
    }
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        name: [
          {
            required: true,
            message: '线路名称不能为空',
            trigger: ['change', 'blur']
          }
        ],
        order: [
          {
            required: true,
            message: '编码不能为空',
            trigger: ['change', 'blur']
          },
          {
            validator: checkCode,
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
        this.$refs.dialogRef.btnLoading = true

        const { data } = await doUpdateLine(this.form)

        this.$refs.dialogRef.btnLoading = false

        if (data.code !== 1) return
        this.$emit('getTableData')
        this.dialogVisible = false
        this.$msg.success('修改成功')
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
