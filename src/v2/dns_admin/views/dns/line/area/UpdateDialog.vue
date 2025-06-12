<template>
  <ants-dialog
    title="修改内容"
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
      label-width="80px"
      label-position="left"
    >
      <ants-form-item label="名称" prop="name">
        <ants-input
          v-model="form.name"
          maxlength="30"
          placeholder="请输入名称"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="排序" prop="weight">
        <ants-input
          v-model="form.weight"
          type="number"
          maxlength="3"
          placeholder="请输入排序"
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="区域描述" prop="info">
        <ants-input
          v-model="form.info"
          maxlength="2000"
          placeholder="请输入区域描述"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 12 }"
          show-word-limit
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doUpdateArea } from '@/v2/dns_admin/api/dns/line'

const defaultForm = {
  id: '',
  name: '',
  info: '',
  weight: '',
  status: 1
}
export default {
  props: {},
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
            message: '名称不能为空',
            trigger: ['change', 'blur']
          }
        ],
        weight: [
          {
            required: true,
            message: '排序不能为空',
            trigger: ['change', 'blur']
          },
          {
            validator: checkCode,
            trigger: 'blur'
          }
        ],
        info: [
          {
            required: true,
            message: '区域描述不能为空',
            trigger: ['change', 'blur']
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

        const { data: res } = await doUpdateArea(this.form)
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$emit('getTableData')
        this.dialogVisible = false
        this.$msg.success('修改区域信息成功')
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
