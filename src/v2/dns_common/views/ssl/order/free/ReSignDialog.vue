<template>
  <el-dialog
    title="重签证书"
    :visible.sync="visible"
    width="450px"
    @close="close"
  >
    <ants-form
      :model="form"
      :rules="rules"
      label-width="80px"
      ref="formRef"
      hide-required-asterisk
    >
      <ants-form-item label="申请域名：">
        <div
          class="relative font-semibold truncate pl-sm pr-xl py-sm border border-ants-border-3 rounded-lg leading-none"
        >
          {{ form.domains }}
          <ants-copy
            icon
            class="absolute right-0 pr-sm"
            :text="form.domains"
          />
        </div>
      </ants-form-item>

      <ants-form-item label="证书类型：" prop="type">
        <ants-radio-group v-model="form.type" size="small">
          <ants-radio
            :label="0"
            text="Letsencrypt"
            style="margin-right: 20px;"
          />
          <ants-radio :label="1" text="ZeroSSL" />
        </ants-radio-group>
      </ants-form-item>
    </ants-form>

    <div slot="footer" class="text-center">
      <ants-button
        size="small"
        type="info"
        @click="visible = false"
        text="取 消"
      />
      <ants-button
        size="small"
        type="primary"
        :loading="btnLoading"
        @click="submit()"
        :text="btnLoading ? '处理中' : '重 签'"
      />
    </div>
  </el-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { renewFreeSsl } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

export default {
  data() {
    return {
      visible: false,
      btnLoading: false,
      form: {
        domains: '',
        orderId: null,
        // 0 = 默认证书 | 1 = ZeroSSl
        type: 0
      },
      rules: {
        type: [
          {
            required: true,
            message: '请输入选择证书类型',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    show({ orderId, srcType = 0, domains }) {
      this.visible = true
      this.form.domains = domains
      this.form.orderId = orderId
      this.form.type = srcType
    },

    async submit() {
      this.btnLoading = true
      try {
        const { type, orderId } = this.form
        const { data: res } = await renewFreeSsl({
          orderId,
          type
        })
        if (res.code !== 1) return
        this.$msg.success(this.antsT('证书重签申请已提交'))
        this.$emit('refresh')
        this.visible = false
      } finally {
        this.btnLoading = false
      }
    },

    close() {}
  }
}
</script>
