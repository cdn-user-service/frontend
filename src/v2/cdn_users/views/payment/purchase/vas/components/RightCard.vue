<template>
  <div>
    <el-card v-loading="$root.loading">
      <TitleBorder title="已选择服务" />
      <ul class="rounded-2xl bg-ants-bg-2 p-lg mb-lg mt-df">
        <li class="flex items-center justify-between">
          <span class="mr-sm">
            {{ antsT('商品名称') }}
          </span>
          <strong>{{ form.good.name }}</strong>
        </li>
        <li class="flex items-center justify-between mt-lg">
          <span class="mr-sm">
            {{ antsT('生效日期') }}
          </span>
          <strong>{{ dateFormatFun(form.startTime) }}</strong>
        </li>
      </ul>

      <ul class="pt-xl border-t border-ants-border-3 space-y-10 px-sm pb-sm">
        <li class="flex items-center justify-between pb-sm">
          <span class="text-ants-text-3">{{ antsT('购买时长') }}：</span>
          <strong>{{ form.sum }} {{ antsT(priceName[form.type]) }}</strong>
        </li>
        <li class="flex items-center justify-between pb-sm">
          <span class="text-ants-text-3">{{ antsT('合计费用') }}：</span>
          <strong class="text-price"
            >{{ $root.priceUnit }} <span class="text-4xl">{{ nowPrice }}</span></strong
          >
        </li>
        <li class="flex items-center">
          <el-checkbox v-model="isRead">{{
            antsT('我已阅读并同意')
          }}</el-checkbox>
          <span
            class="cursor-color text-primary text-sm"
            @click="showAgreementDialog"
            >《{{ $root.webName }} {{ antsT('服务协议') }}》</span
          >
        </li>
        <li>
          <ants-button
            style="width:100%;"
            type="warning"
            class="ants-price-button"
            @click="submitOrder"
            :loading="btnLoading"
            :disabled="$root.loading || btnLoading"
            text="提交订单"
          />
        </li>
      </ul>
    </el-card>

    <AgreementDialog ref="AgreementDialogRef" />
  </div>
</template>

<script>
import { doCreateOrder } from '@/v2/cdn_users/api/payment'
import { priceName } from '@/global/enum'

import AgreementDialog from '@/v2/cdn_users/components/AgreementDialog'

// 验证提示实名认证、绑定手机号
import {
  isUnverified,
  isUnboundMobile,
  showTipsAlert
} from '@/v2/cdn_users/extra/computed'

export default {
  components: {
    AgreementDialog
  },
  props: {
    // 选中购买商品数据
    form: Object
  },
  data() {
    return {
      isRead: false,
      btnLoading: false,
      // 价格类型名称
      priceName
    }
  },
  computed: {
    // 计算价格
    nowPrice() {
      let price = 0
      let planPrice = 0
      if (this.form.good.priceObj) {
        planPrice = this.form.good.priceObj[this.form.type].value
      }
      console.log(planPrice)
      price = planPrice * this.form.sum
      return (price / 100).toFixed(2)
    },

    // 是否需要提示 实名认证
    isUnverified,
    // 是否需要提示 绑定绑定手机号
    isUnboundMobile
  },
  created() {},
  methods: {
    dateFormatFun(originVal = 0) {
      return this.$dayjs(originVal).format('YYYY-MM-DD')
    },

    /**
     * @description: 查看同意协议
     */

    showAgreementDialog() {
      this.$refs.AgreementDialogRef.showDialog()
    },

    /**
     * @description: 提交订单
     */

    async submitOrder() {
      // 检查是否提示实名认证和绑定手机号
      if (
        showTipsAlert({
          isUnverified: this.isUnverified,
          isUnboundMobile: this.isUnboundMobile,
          tag: '购买增值服务'
        })
      ) return

      if (!this.form.good.id) return this.$msg.error(this.antsT('请选择商品！'))
      if (!this.form.serialNumber) return this.$msg.error(this.antsT('请选择绑定套餐！'))
      if (!this.form.type || !this.form.sum) return this.$msg.error(this.antsT('请选择购买时长！'))

      if (!this.isRead) return this.$msg.warning(this.antsT('请阅读并同意服务协议'))

      this.btnLoading = true
      const { data: res } = await doCreateOrder({
        // 订单类型，增值业务购买 = 12
        orderType: 12,
        // 选择套餐的 ID
        targetId: this.form.good.id,
        // 构造的 JSON 数据 type = [m=月， s=季，y=年]， sum = 购买数量
        initJson: JSON.stringify({
          // 绑定套餐的订单号
          serialNumber: this.form.serialNumber,
          // 购买数量
          sum: this.form.sum,
          // 够时长类型， m|s|y
          type: this.form.type,
          // 启用的时间 ？
          startTime: this.form.startTime
        })
      })
      this.btnLoading = false
      if (res.code !== 1) return

      // 前往确认订单页面
      if (res.data && res.data.serialNumber) {
        this.$msg.success(this.antsT('订单创建成功'))
        this.$router.push({
          name: 'Order',
          params: { serialNumber: res.data.serialNumber }
        })
      }
    }
  }
}
</script>
