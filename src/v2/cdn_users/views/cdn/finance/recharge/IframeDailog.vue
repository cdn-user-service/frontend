<template>
  <el-dialog
    title="支付宝支付"
    :visible.sync="dialogVisible"
    @close="resetDialog"
    width="600px"
    :close-on-click-modal="false"
    append-to-body
    center
  >
    <iframe
      :srcdoc="srcdoc"
      frameborder="no"
      border="0"
      marginwidth="0"
      marginheight="0"
      scrolling="no"
      width="200"
      height="200"
      style="overflow: hidden"
    >
    </iframe>
  </el-dialog>
</template>

<script>
// API
import { alipay } from '@/v2/cdn_users/api/payment'

export default {
  components: {},
  props: {},
  data() {
    return {
      dialogVisible: false,
      loading: false,
      src: 'https://www.antsxdp.com',
      orderInfo: {
        body: '',
        outTradeNo: '',
        totalAmount: ''
      },
      srcdoc: ''
    }
  },
  computed: {},
  created() {},
  mounted() {},
  destroyed() {},
  methods: {
    // 显示余额支付对话框
    show(orderInfo = {}) {
      // 如果为 PC 端
      this.dialogVisible = true
      this.orderInfo.body = orderInfo.body
      this.orderInfo.outTradeNo = orderInfo.outTradeNo
      this.orderInfo.totalAmount = orderInfo.totalAmount

      this.getAlipay()
    },

    async getAlipay() {
      this.loading = true
      try {
        const { outTradeNo, totalAmount, body } = this.orderInfo
        const { data: res } = await alipay({
          // 不同客户端支付方式(pc = pc 端 || native = 移动端)
          mode: 'pc',
          // 产品说明信息，这个会显示在支付页面
          subject: body,
          // 主要描述信息，似乎没看到有地方显示
          body,
          // 订单号
          outTradeNo: outTradeNo,
          // 支付金额，以分为单位
          totalAmount: totalAmount
        })
        if (res.code !== 1) return
        this.srcdoc = res.data
      } finally {
        this.loading = false
      }
    },

    /**
     * @description: 支付成功后返回查看结果页面
     */

    goBack() {
      this.dialogVisible = false
      this.$router.replace(this.backUrl)
      // 支付成功后的，回调函数
      this.$emit('refresh')
    },

    // 对话框关闭
    resetDialog() {}
  }
}
</script>
