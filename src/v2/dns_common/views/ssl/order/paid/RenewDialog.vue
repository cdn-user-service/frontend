<template>
  <ants-dialog
    title="SSL证书续费"
    v-model="dialogVisible"
    width="600px"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
    submit-btn-text="立即续费"
  >
    <TitleBorder title="当前证书产品信息" />
    <el-table
      :data="[certDetail]"
      border
      style="width: 100%"
      class="mb-lg"
      size="small"
    >
      <ants-table-column
        prop="productName"
        label="产品名称"
        min-width="150"
      >
        <template #default="{ row }">
          {{ row.orderExtra.productName }}
        </template>
      </ants-table-column>
      <ants-table-column
        prop="domainArrays"
        label="主域名"
        min-width="150"
        show-overflow-tooltip
      >
      </ants-table-column>
      <ants-table-column
        prop="endDate"
        label="有效期"
        min-width="80"
      >
        <template #default="{ row }">
          {{ (row.orderExtra || {}).years }} {{antsT('年')}}
        </template>
      </ants-table-column>
    </el-table>

    <TitleBorder title="续费时长" />
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      class="mt-lg"
      label-width="90px"
      label-position="top"
    >
      <ants-form-item prop="years">
        <ants-input-number
          v-model="form.years"
          placeholder="时长"
          :min="1"
          :max="5"
          :step="1"
          :precision="0"
        />
        <span class="ml-sm">{{antsT('年')}}</span>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doRenewSsl } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const defaultForm = {
  // 续费年限
  years: 1
}
const rules = {
  years: [
    {
      required: true,
      message: '请输入续费年限',
      trigger: ['change', 'blur']
    }
  ]
}

export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      rules,
      // 证书详情
      certDetail: {}
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.certDetail = row
      console.log(row)
    },

    // 表单提交
    submit() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { orderExtra, certId } = this.certDetail
          const { params = {} } = orderExtra
          const { data: res } = await doRenewSsl({
            // 购买年限
            years: this.form.years,
            // 证书ID
            renewId: certId,
            // 产品名称
            productName: orderExtra.productName,
            // 证书产品 code
            productCode: orderExtra.productCode,
            // 传递参数，
            params: {
              ...params,
              administrator: params.Administrator
            }
          })

          if (res.code !== 1) return
          this.$msg.success('下单成功')
          // 前往支付页面
          this.$router.push({
            name: 'Order',
            params: { orderId: (res.data || {}).orderId }
          })
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 表单重置
    closed() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
