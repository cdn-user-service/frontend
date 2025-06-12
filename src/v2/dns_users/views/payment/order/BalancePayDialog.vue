<template>
  <el-dialog
    :title="antsT('已选择余额支付')"
    :visible.sync="dialogVisible"
    @close="resetDialog"
    width="400px"
    :close-on-click-modal="false"
    append-to-body
    center
  >
    <!-- <div class="font-semibold text-center mb-xl">
      {{ antsT('请输入支付密码进行支付，')
      }}<router-link to="/dns/account/info">{{
        antsT('还未设置支付密码？')
      }}</router-link>
    </div>
    <el-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="0"
      label-position="top"
      status-icon
      @submit.native.prevent
    >
      <ants-form-item prop="password" style="margin-bottom:0;">
        <ants-input
          is-bgc
          v-model="form.password"
          type="password"
          prefix-icon="aicon icon-mima1"
          placeholder="请输入支付密码完成支付"
          @keydown.enter.native="submitPayByBalance()"
        />
      </ants-form-item>
    </el-form> -->
    <div class="p-lg bg-ants-bg-5 rounded-2xl">
      <span>
        可用余额：
      </span>
      <span class="font-semibold text-primary">{{
        balance | priceFormat
      }}</span>
    </div>
    <div class="mt-lg p-lg bg-ants-bg-5 rounded-2xl">
      <span>
        支付费用：
      </span>
      <span class="font-semibold text-price">{{
        buyPayable | priceFormat
      }}</span>
    </div>

    <template slot="footer">
      <ants-button
        type="primary"
        size="small"
        @click="submitPayByBalance"
        :loading="btnLoading"
        text="立即支付"
      />
    </template>
  </el-dialog>
</template>

<script>
// API
import { balancePay } from '@/v2/dns_users/api/payment'

export default {
  props: {
    // 用户余额，分为单位
    balance: {
      type: [Number, String],
      default: 0
    },
    // 支付费用，分为单位
    buyPayable: {
      type: [Number, String],
      default: 0
    },
    backUrl: {
      type: String,
      default: '/dns/finance/order'
    }
  },
  data() {
    return {
      dialogVisible: false,
      btnLoading: false,
      form: {
        // 支付密码
        password: '',
        // 订单号
        orderId: ''
      },
      formRules: {
        password: [
          {
            required: true,
            message: '请输入支付密码完成支付',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 显示余额支支付对话框
     * @param {*} orderId
     */

    showDialog(orderId) {
      this.form.orderId = orderId
      this.dialogVisible = true
    },

    /**
     * @description: 余额支付提交
     */

    async submitPayByBalance() {
      // 避免 keydown 时重复提交
      if (this.btnLoading) return
      // this.$refs.formRef.validate(async (valid) => {
      //   if (!valid) return
      this.btnLoading = true
      const { data: res } = await balancePay({
        // 点单号
        order_id: this.form.orderId,
        // 支付密码
        pay_password: this.form.password
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.$msg.success(this.antsT('支付成功'))
      this.dialogVisible = false
      this.$router.replace(this.backUrl)
      // })
    },

    // 表单重置
    resetDialog() {
      this.form.password = ''
      this.btnLoading = false
      // this.$refs.formRef.resetFields()
    }
  }
}
</script>
