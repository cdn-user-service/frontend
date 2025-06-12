<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '工单分类'"
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
      <ants-form-item label="分类名称" prop="title">
        <ants-input
          v-model="form.title"
          placeholder="请输入分类名称"
          maxlength="100"
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="说明信息" prop="description">
        <ants-input
          v-model="form.description"
          placeholder="请输入说明信息"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 10 }"
          maxlength="500"
        ></ants-input>
      </ants-form-item>
      <!-- <ants-form-item label="排 序" prop="weight">
        <ants-input-number
          v-model="form.weight"
          :step="1"
          :min="1"
          :precision="0"
          placeholder="排序"
          size="small"
        ></ants-input-number>
        <span class="ml-sm text-sm text-ants-text-4">(越大越靠前)</span>
      </ants-form-item> -->
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doSaveWorkOrderCategory } from '@/v2/cdn_admin/api/cdn/work-order'

const defaultForm = {
  // 添加对话框的表单数据
  id: null,
  // 父ID
  parentId: 0, 
  title: '',
  description: '',
  // 状态，默认为启用
  status: 1,
  weight: ''
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
        title: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: ['change', 'blur']
          }
        ],
        description: [
          {
            required: true,
            message: '请输入说明信息',
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
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     */

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
        const { data: res } = await doSaveWorkOrderCategory(this.form)
        this.$refs.dialogRef.btnLoading = false
        if (res.code !== 1) return

        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.title + '分类成功')
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
