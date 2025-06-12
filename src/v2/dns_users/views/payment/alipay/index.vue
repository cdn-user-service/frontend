<template>
  <div v-html="alipayHtml"></div>
</template>

<script>
// api
import { alipay } from '@/v2/dns_users/api/payment'
import { isMobile } from '@/utils/env'

export default {
  data() {
    // 获取路由传递过来的支付信息
    const { outTradeNo, totalAmount, body } = this.$route.params
    return {
      alipayHtml: '',

      form: {
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
      }
    }
  },
  created() {
    if (isMobile()) {
      this.form.mode = 'native'
      this.alipayByMobile()
      return
    }
    this.alipayByPc()
  },
  methods: {
    /**
     * @description: 获取支付宝支付页面 html
     */
    async alipayByPc() {
      const { data: res } = await alipay(this.form)

      this.alipayHtml = res.data
      this.$nextTick(() => {
        document.forms[0].submit()
      })
    },

    /**
     * @description: 移动端支付
     */
    async alipayByMobile() {
      const { data: res } = await alipay(this.form)

      // 取回来的是支付宝提供的一段自执行的form表单代码， 把这段代码插入页面中，并手动触发
      const div = document.createElement('div')
      div.innerHTML = res.data
      document.body.appendChild(div)
      document.forms[0].submit()
    }
  }
}
</script>
