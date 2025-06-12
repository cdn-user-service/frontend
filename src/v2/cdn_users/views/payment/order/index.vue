<template>
  <div class="payment-main mx-auto animated fadeInUp">
    <div class="pb-lg flex justify-between items-center">
      <div>
        <strong class="text-3xl mr-xs">{{
          antsT('请确认以下商品信息')
        }}</strong>
        <span class="text-ants-text-3">{{
          antsT('确认无误后再提交订单')
        }}</span>
      </div>
      <ants-button
        icon="el-icon-back"
        size="mini"
        type="primary"
        plain
        @click="$router.go(-1)"
        text="返回重选"
      />
    </div>

    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 16 }"
        :md="{ span: 16 }"
        :lg="{ span: 16 }"
        :xl="{ span: 16 }"
      >
        <LeftCard :order-data="orderData" />
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 8 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
      >
        <RightCard :order-data="orderData" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
// API
import { queryPayResult } from '@/v2/cdn_users/api/payment'

import LeftCard from './components/LeftCard'
import RightCard from './components/RightCard'

export default {
  components: {
    LeftCard,
    RightCard
  },
  data() {
    return {
      // 订单号
      serialNumber: this.$route.params.serialNumber,
      // 订单数据
      orderData: {
        // 订单类型，10 = CDN 套餐， 11 = CDN续费， 12 = 增值业务， 13 = 套餐升级
        orderType: null,
        // 订单号
        serialNumber: null,
        // 支付金额，分为单位，默认设为 1 大于用于余额 0
        payable: 1,
        // 产品ID
        targetId: null,
        // 支付状态，10 = 待支付， 14 = 支付成功
        status: 10,

        // 购买时长
        buy_obj: {
          num: 1,
          type: 'm'
        },
        // 产品参数
        product_obj: {
          // 产品名称
          name: '',
          // 产品单价
          productJson: '',
          // 产品属性
          attrJson: ''
        }
      }
    }
  },
  computed: {},
  created() {
    this.getOrderDetail()
  },
  methods: {
    // 根据订单号获取订单数据
    async getOrderDetail() {
      this.$root.loading = true
      try {
        const { data: res } = await queryPayResult({
          SerialNumber: this.serialNumber
        })
        if (res.code !== 1) return
        if (!res.data) {
          this.$router.replace('/cdn/plan/list')
          return this.$msg.error('订单错误')
        }

        const statusObj = {
          11: '订单已超时，请重新下单！',
          12: '订单已关闭，请重新下单！',
          13: '订单已作废，请重新下单！',
          14: '订单已支付，勿重复支付！'
        }
        const status = +res.data.status
        if (status in statusObj) {
          return this.$alert(
            this.antsT(statusObj[status]),
            this.antsT('友情提示'),
            {
              center: true,
              type: 'warning',
              callback: action => {
                this.$router.go(-1)
              }
            }
          )
        }

        // 如果为待支付订单，即正常订单
        if (status == 10) {
          const goodsObj = (res.data && JSON.parse(res.data.initJson)) || {}
          console.log(goodsObj)
          let buyObj = goodsObj.buy_obj || {}
          let priceObj = goodsObj.price_obj || {}
          let productObj = goodsObj.product_obj || {}
          if (typeof goodsObj.buy_obj === 'string') {
            buyObj = JSON.parse(goodsObj.buy_obj)
          }

          if (typeof goodsObj.price_obj === 'string') {
            priceObj = JSON.parse(goodsObj.price_obj)
          }

          if (typeof goodsObj.product_obj === 'string') {
            productObj = JSON.parse(goodsObj.product_obj)
          }

          this.orderData = {
            ...res.data,
            // 解析产品参数 JSON
            buy_obj: buyObj,
            price_obj: priceObj,
            product_obj: productObj,

            // 续费用到的
            priceType: goodsObj.type
          }
          console.log(this.orderData)
        }
      } finally {
        this.$root.loading = false
      }
    }
  }
}
</script>
