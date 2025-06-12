<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '自定义分组'"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      label-position="top"
    >
      <ants-form-item label="分组名称" prop="remark">
        <ants-input v-model="form.remark" placeholder="请输入分组名称" />
      </ants-form-item>

      <!-- <ants-form-item label="备注信息" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 10 }"
        />
      </ants-form-item> -->
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doSaveIpOrControl } from '@/v2/cdn_admin/api/cdn/ip'

const defaultForm = {
  // 父ID，默认为 0
  parentId: 0,
  // 添加时 id为 0
  control: -1,
  id: 0,
  // 备注信息 = 分组名称
  remark: '',
  status: 1
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
        remark: [
          {
            required: true,
            message: '请输入分组名称',
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
        const { data: res } = await doSaveIpOrControl(this.form)
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
