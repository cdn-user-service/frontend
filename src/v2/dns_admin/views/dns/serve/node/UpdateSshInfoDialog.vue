<template>
  <ants-dialog
    title="SSH信息"
    v-model="dialogVisible"
    width="500px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
    >
      <ants-form-item
        label="节点IP"
        prop="host"
      >
        <ants-input
          v-model="form.host"
          disabled
          placeholder="请输入节点IP"
        />
      </ants-form-item>
      <ants-form-item
        label="端口号"
        prop="port"
      >
        <ants-input
          v-model="form.port"
          placeholder="请输入端口号"
        />
      </ants-form-item>
      <ants-form-item
        label="账号"
        prop="username"
      >
        <ants-input
          v-model="form.username"
          placeholder="请输入账号"
        />
      </ants-form-item>
      <ants-form-item
        label="密码"
        prop="pwd"
      >
        <ants-input
          v-model="form.pwd"
          placeholder="请输入密码"
          type="password"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doUpdateNodeSsh } from '@/v2/dns_admin/api/dns/serve'
const defaultForm = {
  id: 0,
  // 节点ID
  clientId: 0,
  // 主机
  host: '',
  // 端口号
  port: 22,
  // SSH账号
  username: '',
  // 密码
  pwd: ''
}
export default {
  data() {
    // 验证规则
    const { isPort } = this.$validator

    return {
      // 添加修改分组数据
      dialogVisible: false,

      form: {
        ...defaultForm
      },
      // 表单验证规则
      rules: {
        port: [
          {
            required: true,
            message: '请输入端口号',
            trigger: ['blur', 'change']
          },
          {
            validator: isPort(),
            trigger: 'blur'
          }
        ],
        username: [
          {
            required: true,
            message: '请输入账号',
            trigger: ['blur', 'change']
          }
        ],
        pwd: [
          {
            required: true,
            message: '请输入密码',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     */

    show(sshInfo = {}) {
      this.dialogVisible = true
      this.form = {
        ...defaultForm,
        ...sshInfo
      }
    },

    /**
     * @description: 添加编辑参数提交
     */

    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doUpdateNodeSsh(this.form)

          this.$refs.dialogRef.btnLoading = false
          if (res.code !== 1) return
          this.$emit('refresh')
          this.$msg.success('操作成功')
          this.dialogVisible = false
        } catch (error) {
          this.$refs.dialogRef.btnLoading = false
          console.log(error)
        }
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
