<template>
  <ants-dialog
    title="SSH信息"
    v-model="dialogVisible"
    width="500px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <ants-form-item label="节点IP" prop="clientIp">
        <ants-input
          v-model="form.clientIp"
          disabled
          placeholder="请输入节点IP"
        />
      </ants-form-item>
      <ants-form-item label="端口号" prop="sshPort">
        <ants-input v-model="form.sshPort" placeholder="请输入端口号" />
      </ants-form-item>
      <ants-form-item label="账号" prop="sshUser">
        <ants-input v-model="form.sshUser" placeholder="请输入账号" />
      </ants-form-item>
      <ants-form-item label="密码" prop="sshPwd">
        <ants-input
          v-model="form.sshPwd"
          placeholder="请输入密码"
          type="password"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doUpdateNodeSsh } from '@/v2/cdn_admin/api/cdn/node'

const defaultForm = {
  id: 0,
  // 主机
  clientIp: '',
  // 端口号
  sshPort: 22,
  // SSH账号
  sshUser: '',
  // 密码
  sshPwd: ''
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
        sshPort: [
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
        sshUser: [
          {
            required: true,
            message: '请输入账号',
            trigger: ['blur', 'change']
          }
        ],
        sshPwd: [
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
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { id, sshPort, sshUser, sshPwd } = this.form
          const { data: res } = await doUpdateNodeSsh({
            id,
            sshPort,
            sshUser,
            sshPwd
          })

          if (res.code !== 1) return
          this.$emit('refresh')
          this.$msg.success('操作成功')
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
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
