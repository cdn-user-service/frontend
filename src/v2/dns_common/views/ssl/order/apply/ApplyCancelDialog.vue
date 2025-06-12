<template>
  <div class="inline-block">
    <ants-dialog
      title="SSL证书订单取消"
      v-model="dialogVisible"
      width="550px"
      ref="dialogRef"
      @closed="closed"
      @submit="submit"
      submitBtnText="确定取消订单"
    >
      <div class="ants-tips_box mb-lg">
        <i class="el-icon-info"></i>
        {{
          antsT(
            '订单取消后将会按原路退回已支付的金额！可前往退款记录页面查看详情。'
          )
        }}
      </div>
      <ants-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="90px"
        label-position="top"
      >
        <ants-form-item label="取消订单原因" prop="reason">
          <ants-input
            v-model="form.reason"
            placeholder="请输入取消订单原因"
            type="textarea"
            :rows="6"
            maxlength="500"
            show-word-limit
          />
        </ants-form-item>
      </ants-form>
    </ants-dialog>

    <ants-button
      v-if="certId"
      style="margin-left: 10px;"
      size="small"
      type="danger"
      text="订单取消"
      @click="show()"
      icon="el-icon-close"
      :loading="btnLoading"
    />
  </div>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doCancelSslCert } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const defaultForm = {
  // 订单号
  certId: '',
  // 取消订单原因
  reason: ''
}
const rules = {
  reason: [
    {
      required: true,
      message: '请输入退款原因',
      trigger: ['change', 'blur']
    }
  ]
}

export default {
  props: {
    certId: {
      type: [String, Number]
    }
  },
  data() {
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      rules,
      btnLoading: false
    }
  },
  methods: {
    // 对话框显示
    show(certId = '') {
      this.form.certId = certId || this.certId
      this.dialogVisible = true
    },

    // 表单提交
    submit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        try {
          const { data: res } = await doCancelSslCert(this.form)
          if (res.code !== 1) return
          this.$msg.success('已成功取消订单')
          this.$emit('refresh')
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 表单重置
    closed() {
      this.form.reason = ''
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
