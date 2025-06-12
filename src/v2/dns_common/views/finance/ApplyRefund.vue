<template>
  <ants-dialog
    title="申请退款"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
    submit-btn-text="提交申请"
  >
    <el-row :gutter="10" class="-mt-sm">
      <el-col :span="12" v-for="(item, key) in orderObj" :key="key">
        <div
          class="bg-ants-bg-4 rounded-2xl px-df py-sm mb-sm"
          style="height:62px;"
        >
          <div class="mb-xs font-semibold">
            {{ item }}
          </div>
          <div class="truncate">
            {{ orderDetail[key] || '-' }}
          </div>
        </div>
      </el-col>
    </el-row>

    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="90px"
      label-position="top"
    >
      <ants-form-item label="退款原因" prop="reason">
        <ants-input
          v-model="form.reason"
          placeholder="请输入退款原因"
          type="textarea"
          :rows="6"
          maxlength="500"
          show-word-limit
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { applyRefund } from '@/v2/dns_users/api/dns/finance'
import { priceFormatFun } from '@/utils/public'

const defaultForm = {
  // 退款金额
  amount: 0,
  // 订单号
  orderId: '',
  // 退款原因
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

const orderObj = {
  orderId: '订单号',
  productName: '商品名称',
  goodsType: '商品类型',
  buyPayable: '订单金额'
}
export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      rules,

      orderObj,
      // 订单详情
      orderDetail: {}
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.orderDetail = {
        ...row,
        buyPayable: priceFormatFun(row.buyPayable)
      }

      this.form.orderId = row.orderId
      this.form.amount = row.buyPayable
    },

    // 表单提交
    submit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await applyRefund(this.form)
          if (res.code !== 1) return
          this.$msg.success('退款申请提交成功，我们会尽快处理')
          this.dialogVisible = false
          this.$emit('refresh')
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
