<template>
  <ants-dialog
    v-model="dialogVisible"
    :title="`添加${typeName}`"
    width="550px"
    ref="dialogRef"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="font-bold mb-sm text-center">
      <el-tag size="small" type="primary"
        >主IP：{{ parentData.clientIp }}</el-tag
      >
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      label-position="top"
    >
      <ants-form-item :label="`请输入${typeName}，一行一个`" prop="clientIps">
        <ants-input
          v-model="form.clientIps"
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 20 }"
          :placeholder="`请输入${typeName}，一行一个`"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doBatchCreateBackupNode, doAddIps } from '@/v2/cdn_admin/api/cdn/node'

const defaultForm = {
  // 该 id 为主IP的id
  id: null,
  // ip，多个用 逗号分隔
  clientIps: '',
  // 类型: 3 = 备IP | 4 = 回源IP
  clientType: 3
}

export default {
  data() {
    const { isIps } = this.$validator
    return {
      dialogVisible: false,
      // 主IP数据
      parentData: {
        id: null,
        clientIp: ''
      },
      form: {
        ...defaultForm
      },
      formRules: {
        clientIps: [
          {
            required: true,
            message: '请输入IP，一行一个',
            trigger: ['change', 'blur']
          },
          {
            validator: isIps(),
            trigger: 'blur'
          }
        ],
        clientType: [
          {
            required: true,
            message: '请选择IP类型',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  computed: {
    typeName() {
      return this.form.clientType === 3 ? '备IP' : '回源IP'
    }
  },
  methods: {
    // 展示对话框
    showDialog({ id, clientIp, clientType }) {
      this.dialogVisible = true
      this.form.id = id
      this.form.clientType = clientType
      this.parentData = {
        id,
        clientIp
      }
    },

    // 表单提交
    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data } = await doAddIps({
            ...this.form,
            clientIps: this.form.clientIps.trim().replace(/[\r\n\s]+/g, ',')
          })

          if (data.code !== 1) return
          this.dialogVisible = false
          this.$emit('refresh')
          this.$msg.success('添加成功')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 添加DNS表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
