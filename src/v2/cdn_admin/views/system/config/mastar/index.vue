<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      space-class="space-y-6"
      size="medium"
      style="max-width: 400px;"
    >
      <ants-form-item label="主控IP" prop="masterIp">
        <ants-input v-model="form.masterIp" placeholder="请输入主控IP" />
      </ants-form-item>

      <ants-form-item label="Redis 端口" prop="redisPort">
        <ants-input v-model="form.redisPort" placeholder="请输入Redis 端口" maxlength="200" />
      </ants-form-item>

      <ants-form-item label="Redis 密码" prop="redisPwd">
        <ants-input v-model="form.redisPwd" placeholder="请输入Redis 密码" />
      </ants-form-item>

      <ants-form-item>
        <ants-button
          size="small"
          type="primary"
          text="开始迁移"
          icon="el-icon-check"
          :loading="btnLoading"
          @click="doSubmit"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
// API
import { transferMaster } from '@/v2/cdn_admin/api/home/auth'

export default {
  data() {
    const { isPort, isIp } = this.$validator
    return {
      btnLoading: false,
      form: {
        // 主控IP
        masterIp: '',
        // resis密码
        redisPwd: '',
        redisPort: null
      },

      formRules: {
        masterIp: [
          {
            required: true,
            message: '请输入主控IP',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp(),
            trigger: 'blur'
          }
        ],
        redisPwd: [
          {
            required: true,
            message: '请输入Redis密码',
            trigger: ['change', 'blur']
          }
        ],
        redisPort: [
          {
            required: true,
            message: '请输入Redis端口',
            trigger: ['change', 'blur']
          },
          {
            validator: isPort(),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {},
  methods: {
    async doSubmit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
          const { data: res } = await transferMaster(this.form)
          if (res.code !== 1) return
          this.$msg.success('迁移成功')
          this.$refs.formRef.resetFields()
        } finally {
          this.btnLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
