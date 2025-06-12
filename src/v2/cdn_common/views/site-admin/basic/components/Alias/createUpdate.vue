<template>
  <ants-dialog
    :title="title + '别名'"
    v-model="dialogVisible"
    width="550px"
    @closed="closed"
    @submit="submitForm"
    ref="dialogRef"
  >
    <div class="text-center font-bold mb-sm">
      <el-tag type="primary" size="small">
        {{ antsT('主站') }}：{{ $route.query.domain }}
      </el-tag>
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
    >
      <!-- 添加 -->
      <ants-form-item
        label="请输入别名（一行一个，不能重复）"
        prop="value"
        style="margin:0;"
        v-if="form.id === 0"
      >
        <ants-input
          type="textarea"
          v-model="form.value"
          :autosize="{ minRows: 6, maxRows: 20 }"
          placeholder="请输入别名（一行一个，不能重复）"
        />
      </ants-form-item>

      <!-- 编辑 -->
      <ants-form-item v-else label="别名" prop="value">
        <ants-input
          v-model.trim="form.value"
          placeholder="请输入别名"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// 表单初始化数据
const defaultForm = {
  // 添加 id = 0
  id: 0,
  // 别名
  value: ''
}

export default {
  data() {
    // 验证规则
    const { isDomains } = this.$validator

    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        value: [
          {
            required: true,
            message: '请输入别名（一行一个，不能重复）',
            trigger: ['change', 'blur']
          },
          {
            validator: isDomains(),
            trigger: 'blur'
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

      this.title = '添加'

      if (row.id) {
        this.title = '编辑'
        this.form = {
          ...defaultForm,
          ...row
        }
      }
    },

    /**
     * @description: 添加提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const valueStr = this.form.value.trim().replace(/[\r\n\s]+/g, ',')
          const arr = valueStr.split(',').map(item => {
            return {
              id: this.form.id,
              value: item
            }
          })
          const res = await this.$listeners.saveSiteAttr({
            alias: arr
          })
          if (!res) return
          this.$listeners.refresh()
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 添加DNS表单重置
    closed() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
