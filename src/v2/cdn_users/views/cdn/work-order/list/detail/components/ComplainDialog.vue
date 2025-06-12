<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="投诉建议"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
    submit-btn-text="投诉"
    class="complain-box"
  >
    <ul class="ants-tips_box space-y-2 mb-lg -mt-sm">
      <li>很抱歉给您带来困扰，请选择投诉的内容，我们将尽快完善服务&产品。</li>
      <li>如果您有什么建议，请补充。</li>
    </ul>
    <ants-form
      :model="form"
      :rules="formmRules"
      ref="formRef"
      label-width="0px"
      status-icon
      space-class="space-y-5"
    >
      <ants-form-item prop="reason">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="font-bold">投诉服务</div>
            <ants-checkbox-group v-model="form.reason">
              <ants-checkbox label="服务态度差" text="服务态度差"/>
              <ants-checkbox label="解决速度慢" text="服务态度差"/>
              <ants-checkbox label="技术能力弱" text="服务态度差"/>
              <ants-checkbox label="问题未解决" text="服务态度差"/>
            </ants-checkbox-group>
          </el-col>
          <el-col :span="8">
            <div class="font-bold">投诉产品</div>
            <ants-checkbox-group v-model="form.reason">
              <ants-checkbox label="产品功能不足" text="服务态度差"/>
              <ants-checkbox label="产品规则不合理" text="服务态度差"/>
              <ants-checkbox label="产品稳定性差" text="服务态度差"/>
            </ants-checkbox-group>
          </el-col>
          <el-col :span="8">
            <div class="font-bold">投诉流程</div>
            <ants-checkbox-group v-model="form.reason">
              <ants-checkbox label="退款流程不合理" text="服务态度差"/>
              <ants-checkbox label="提现流程不合理" text="服务态度差"/>
              <ants-checkbox label="发票流程不合理" text="服务态度差"/>
              <ants-checkbox label="合同流程不合理" text="服务态度差"/>
              <ants-checkbox label="其他流程不合理" text="服务态度差"/>
            </ants-checkbox-group>
          </el-col>
        </el-row>
      </ants-form-item>
      <ants-form-item prop="extra_reason">
        <div class="font-bold">补充描述</div>
        <ants-input
          v-model="form.extra_reason"
          :rows="5"
          type="textarea"
          placeholder="请输入补充描述"
          maxlength="2000"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        order_id: this.$route.query.id,
        extra_reason: '',
        reason: []
      },
      formmRules: {
        reason: [
          {
            type: 'array',
            required: true,
            message: '请至少选择一项投诉内容',
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 投诉提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await this.$http.post(
          'users/service_order/suggestion_content',
          this.$qs.stringify(this.form)
        )
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$parent.getGoodsList()
        this.$msg.success('投诉成功，我们会尽快处理并回复您')
        this.dialogVisible = false
      })
    },

    // 投诉表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>

<style lang="scss">
.complain-box {
    .el-form-item__content {
      line-height: 26px;
    }
  }
</style>
