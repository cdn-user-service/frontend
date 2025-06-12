<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`修改DNS配置【${clientIp}】`"
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
      <ants-form-item label="DNS线路" prop="line">
        <ants-select
          v-model="form.line"
          filterable
          placeholder="请选择DNS线路"
          :loading="lineLoading"
        >
          <ants-option
            v-for="(value, key) in lineObj"
            :key="key"
            :label="value"
            :value="key"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="TTL" prop="ttl">
        <ants-input-number
          v-model="form.ttl"
          placeholder="ttl"
          :min="1"
          :precision="0"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API 
import { doUpdateClient } from '@/v2/cdn_admin/api/cdn/node'

const defaultForm = {
  id: 0,
  line: '',
  ttl: '',
  status: 0
}

export default {
  props: {
    // 线路列表
    lineObj: Object,
    lineLoading: Boolean
  },
  data() {
    return {
      dialogVisible: false,
      clientIp: '',
      form: {
        ...defaultForm
      },
      formRules: {
        line: [
          {
            required: true,
            message: '请选择DNS线路',
            trigger: 'change'
          }
        ],
        ttl: [
          {
            required: true,
            message: '请输入TTL',
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
      const { id, line, ttl, status, clientIp } = row
      this.clientIp = clientIp
      this.form = {
        ...this.form,
        id,
        line,
        ttl,
        status
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const data = await doUpdateClient(this.form)
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
