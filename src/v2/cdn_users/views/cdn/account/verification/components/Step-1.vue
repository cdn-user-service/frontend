<template>
  <div class="qr_code_box">
    <span
      class="qr_icon_span aicon icon-icon_xinyong_xianxing_jijin-179"
    ></span>

    <ul class="flex-1 space-y-12 pt-lg">
      <li>
        <TitleBorder title="扫码支付认证费用" class="text-xxl text-primary" />
      </li>
      <li class="text-ants-text-4">
        {{ antsT('请完成扫码支付后，再进行人身核验认证') }}
      </li>
      <li class="">
        <strong class="mr-lg">{{ antsT('支付金额') }}</strong>
        <strong class="text-price"
          >{{ orderData.totalAmount | priceFormat }}
        </strong>
      </li>
      <li class="">
        <strong class="mr-lg">{{ antsT('支付方式') }}</strong>
        <ants-radio-group
          size="small"
          v-model="activePayway"
          @change="changePayWay"
        >
          <ants-radio-button
            label="WECHAT"
            v-if="powerObj.wechat"
            text="微信支付"
          />
          <ants-radio-button
            label="ALIPAY"
            v-if="powerObj.alipay"
            text="支付宝支付"
          />
        </ants-radio-group>
      </li>

      <!-- 支付宝支付 -->
      <li v-if="powerObj.alipay && activePayway === 'ALIPAY'">
        <div class="my-xxl" v-if="!isClickAliPay">
          <ants-button
            type="success"
            @click="goToAliPayPage"
            text="开始认证"
            icon="el-icon-right"
          />
        </div>

        <div v-else>
          <div class="my-lg">
            {{ antsT('正在等待支付结果...') }}
          </div>
          <ants-button
            size="small"
            type="success"
            class="mb-xxl"
            text="已完成支付？"
          />
        </div>
      </li>

      <!-- 微信支付 -->
      <li
        class="qr_img_box"
        v-else-if="powerObj.wechat && activePayway === 'WECHAT'"
      >
        <div class="vue_qr_box" v-loading="loading">
          <vue-qr
            ref="qrPayRef"
            :text="wechatPayData.url"
            :margin="0"
            colorDark="#262F3E"
            colorLight="#fff"
            :logoSrc="wechatPayData[activePayway]"
            :logoScale="0.15"
            :size="180"
          ></vue-qr>
        </div>
        <div
          class="mt-lg py-sm text-sm text-ants-bg-1 rounded-lg"
          style="background-color: #09BB07;"
        >
          {{ antsT('请打开手机 微信 ，扫一扫完成支付') }}
        </div>
      </li>

      <li class="my-lg" v-else>
        <strong class="text-error">{{
          antsT('请联系管理员开启支付通道！')
        }}</strong>
      </li>
    </ul>
  </div>
</template>

<script>
// API
import { authStatus } from '@/v2/cdn_users/api/cdn/account'
import { wechatPay } from '@/v2/cdn_users/api/payment'

import vueQr from 'vue-qr'

export default {
  components: {
    vueQr
  },
  data() {
    return {
      loading: false,
      // 支付方式，默认选择微信支付
      activePayway: 'WECHAT',

      // 订单支付数据
      orderData: {
        // 支付金额
        totalAmount: null,
        // 订单号，用户生成支付二维码
        outTradeNo: null
      },

      // 微信支付二维码显示
      wechatPayData: {
        url: '',
        WECHAT: require('@/assets/img/wechat-icon.png')
        // ALIPAY: require('@/assets/img/alipay-icon.png')
      },
      // 支付宝是否支付
      isClickAliPay: false
    }
  },
  computed: {
    // 后台开启了哪些支付方式
    powerObj({ $root }) {
      const {
        WXPAY_CONFIG_KEY: wechat,
        ALIPAY_CONFIG_KEY: alipay
      } = $root.powerObj
      return { wechat, alipay }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 获取微信支付二维码
     */
    async getWechatCode() {
      if (!this.powerObj.wechat) return

      this.loading = true
      const { outTradeNo, totalAmount } = this.orderData

      const { data: res } = await wechatPay({
        // 不同客户端支付方式(native = pc 端 || mweb = 移动端)
        mode: 'native',
        // 主要描述信息
        body: '实名认证',
        // 订单号
        outTradeNo,
        // 支付金额，以分为单位
        totalAmount
      })

      this.loading = false

      if (res.code !== 1) return
      this.wechatPayData.url = res.data || ''

      // 定时检测支付状态
      this.$emit('checkResult')
    },

    /**
     * @description: 支付宝做跳转页面支付
     */
    goToAliPayPage() {
      const { outTradeNo, totalAmount } = this.orderData

      // 前往支付宝支付页面
      const ROUTER_DATA = this.$router.resolve({
        name: 'Alipay',
        params: {
          // 主要描述信息
          body: '实名认证',
          // 订单号
          outTradeNo,
          // 支付金额，以分为单位
          totalAmount
        }
      })
      window.open(ROUTER_DATA.href, '_blank')
      this.isClickAliPay = true

      // 定时检测支付状态
      this.$emit('checkResult')
    },

    /**
     * @description: 切换支付方式
     */

    changePayWay(val) {
      // 切换支付方式的时候清除定时器
      this.$emit('clearTimer')

      // 如果为微信支付
      if (val === 'WECHAT') this.getWechatCode()
    }
  }
}
</script>

<style lang="scss" scoped></style>
