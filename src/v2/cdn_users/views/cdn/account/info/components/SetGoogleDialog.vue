<template>
  <div>
    <ants-dialog
      title="绑定Google Authenticator"
      v-model="dialogVisible"
      width="550px"
      ref="dialogRef"
      @close="resetForm"
      @submit="submitForm"
    >
      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-position="top"
      >
        <div class="font-bold text-center">
          {{ antsT('请使用【Authenticator】APP 扫一扫下方二维码，获取验证码') }}
        </div>

        <div
          class="relative mt-lg mx-auto border border-ants-border-2 rounded-2xl overflow-hidden"
          style="height: 200px; width: 200px"
          v-loading="loading"
        >
          <img
            v-if="imgBaseDate"
            class="h-full w-full"
            :src="`data:image/png;base64,${imgBaseDate}`"
          />
          <span v-else>{{ antsT('获取二维码失败') }}</span>
        </div>

        <ants-form-item prop="code" class="code_box">
          <ants-input
            is-bgc
            v-model="form.code"
            prefix-icon="aicon icon-yanzhengma2"
            placeholder="验证码"
          />
        </ants-form-item>
      </ants-form>
    </ants-dialog>
  </div>
</template>

<script>
import { googleQrcode, googleBind } from '@/v2/cdn_users/api/login'

export default {
  components: {},
  data() {
    return {
      dialogVisible: false,
      loading: false,
      form: {
        secretKey: '',
        code: ''
      },
      formRules: {
        code: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur']
          }
        ]
      },

      imgBaseDate: '',
      logoSrc: ''
    }
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
      this.getGoogleQrcode()
    },

    // 获取qrcode
    async getGoogleQrcode() {
      this.loading = true
      try {
        const { data: res } = await googleQrcode()
        if (res.code !== 1) return
        const obj = res.data || {}
        this.imgBaseDate = obj.imgBaseDate
        this.form.secretKey = obj.secretKey
      } finally {
        this.loading = false
      }
    },

    toQrcode() {},

    // 提交
    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          // 发起请求
          const { data: res } = await googleBind(this.form)
          if (res.code !== 1) return
          this.$msg.success(this.antsT('绑定Google账号成功'))
          // 重新获取用户信息
          this.$listeners.getUserData()
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
