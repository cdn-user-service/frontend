<template>
  <ants-dialog
    title="同意退款"
    v-model="dialogVisible"
    width="600px"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
    top="60px"
    submit-btn-text="同意退款"
  >
    <ul class="-mt-sm rounded-2xl bg-ants-bg-4 p-df space-y-sm mb-lg">
      <li
        v-for="(item, key) in orderObj"
        :key="key"
        class="flex"
      >
        <strong class="inline-block" style="min-width:100px;">{{item}}：</strong>
        <div class="flex-1">
          {{ orderDetail[key] || '-' }}
        </div>
      </li>
    </ul>

    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="90px"
      label-position="left"
    >
      <ants-form-item
        label="退款金额"
        prop="amount"
      >
        <ants-input-number
          v-model="form.amount"
          placeholder="请输入退款金额"
          :precision="2"
          :min="0"
          :max="maxAmount"
        />
      </ants-form-item>
      <ants-form-item
        label="退款说明"
        prop="remark"
      >
        <ants-input
          v-model="form.remark"
          placeholder="请输入退款说明"
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
import { doRefund } from '@/v2/dns_admin/api/dns/finance'
import { priceFormatFun } from '@/utils/public'

const defaultForm = {
  id: null,
  // 退款金额
  amount: 0,
  // 退款原因
  reason: '',
  // 退款备注
  remark: ''
}
const rules = {
  amount: [
    {
      required: true,
      message: '请输入退款金额',
      trigger: ['change', 'blur']
    }
  ],
  remark: [
    {
      required: true,
      message: '请输入退款说明',
      trigger: ['change', 'blur']
    }
  ]
}

const orderObj = {
  userId: '申请用户',
  refundId: '退款订单号',
  orderId: '原始订单号',
  goodsType: '商品类型',
  createtime: '申请时间',
  amountStr: '申请退款金额',
  reason: '申请退款原因'
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
      orderDetail: {
        amount: 0
      }
    }
  },
  computed: {
    // 最大退款金额
    maxAmount() {
      return this.orderDetail.amount / 100
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.orderDetail = {
        ...row,
        amountStr: priceFormatFun(row.amount)
      }

      this.form.id = row.id
      this.form.amount = row.amount / 100
    },

    // 表单提交
    submit() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doRefund({
            ...this.form,
            amount: this.form.amount * 100
          })
          if (res.code !== 1) return
          this.$msg.success('同意退款成功')
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
