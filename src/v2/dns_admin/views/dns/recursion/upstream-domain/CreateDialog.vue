<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '转发域名'"
    width="600px"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
    >
      <!-- 修改 -->
      <ants-form-item label="转发域名" prop="sourceDomain" v-if="form.id">
        <ants-input
          v-model="form.sourceDomain"
          placeholder="请输入转发域名"
        ></ants-input>
      </ants-form-item>

      <!-- 多个添加 -->
      <ants-form-item label="转发域名" prop="sourceDomainS" v-else>
        <ants-input
          v-model="form.sourceDomainS"
          placeholder="请输入转发域名，一行一个，不能有空格。
例如：domain.com"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 12 }"
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="DNS服务器" prop="targetValue">
        <ants-input
          v-model="form.targetValue"
          placeholder="请输入上层DNS服务器IP，多个之间用“ , ”隔开。不能超过3个"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="备注信息" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { saveDnsRecursive } from '@/v2/dns_admin/api/dns/recursion'

const defaultForm = {
  // 添加对话框的表单数据
  id: null,
  sourceDomainS: '',
  sourceDomain: '',
  targetValue: '',
  remark: ''
}
export default {
  props: {},
  data() {
    // 验证规则
    const { isName } = this.$validator

    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        // 添加用户对话框的规则
        sourceDomainS: [
          {
            required: true,
            message: '请输入转发域名，一行一个',
            trigger: ['change', 'blur']
          }
          //   {
          //     validator: isName(),
          //     trigger: 'blur'
          //   }
        ],
        sourceDomain: [
          {
            required: true,
            message: '请输入转发域名',
            trigger: ['change', 'blur']
          }
        ],
        targetValue: [
          {
            required: true,
            message: '请输入上层DNS服务器IP',
            trigger: ['change', 'blur']
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
     * @description: 修改展示对话框
     * @param {*} row
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

        const { sourceDomainS, id } = this.form

        const { data: res } = await saveDnsRecursive({
          mode: 4,
          ...this.form,
          // 添加，用逗号分隔
          sourceDomainS: !id ? sourceDomainS.trim().replace(/[\r\n]+/g, ',') : null
        })

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.title + '成功')
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
