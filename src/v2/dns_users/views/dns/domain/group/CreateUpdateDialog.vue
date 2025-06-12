<template>
  <ants-dialog
    :title="title + '分组'"
    width="550px"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="resetForm"
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
          maxlength="50"
          show-word-limit
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="remark" label="备注">
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
          maxlength="50"
          show-word-limit
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="weight" label="排序">
        <ants-input-number
          v-model="form.weight"
          :precision="0"
          :step="1"
          :max="9999"
          placeholder="排序"
          size="small"
        ></ants-input-number>
        <span class="ml-sm text-sm text-ants-text-4"
          >（{{ antsT('越大越靠前') }}）</span
        >
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import {
  getDomainGroupDetail,
  doCreateUpdateDomainGroup
} from '@/v2/dns_users/api/dns/domain'

const defaultForm = {
  id: 0,
  name: '',
  remark: '',
  weight: 1

  //   domainIds: '' 仅修改的时候有
}

const rules = {
  name: [
    {
      required: true,
      message: '请输入分组名称',
      trigger: ['change', 'blur']
    }
  ],
  remark: [
    {
      required: true,
      message: '请输入备注信息',
      trigger: ['change', 'blur']
    }
  ],
  weight: [
    {
      required: true,
      message: '请输入排序',
      trigger: ['change', 'blur']
    }
  ]
}

export default {
  data() {
    return {
      btnLoading: false,
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: rules
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
          ...defaultForm,
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
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doCreateUpdateDomainGroup(this.form)
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.title + '分组成功')
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
