<template>
  <div>
    <el-card v-loading="$root.loading">
      <TitleBorder title="已选择套餐" />
      <ul class="rounded-2xl bg-ants-bg-2 p-lg mb-lg mt-df">
        <li class="">
          <span class="mr-lg">套餐名称</span>
          <span class="font-bold">{{ plan.name }}</span>
        </li>
        <li class="mt-lg">
          <span class="mr-lg">计费方式</span>
          <el-tag size="small" type="primary">流量月结</el-tag>
        </li>
      </ul>

      <ul class="pt-xl border-t border-ants-border-3 space-y-10 px-sm pb-sm">
        <li class="flex items-center justify-between pb-sm">
          <span class="text-ants-text-3">购买方式：</span>
          <strong>按{{priceName[type]}}购买</strong>
        </li>
        <li class="flex items-center justify-between pb-sm">
          <span class="text-ants-text-3">购买时长：</span>
          <strong>{{ sum }} {{ priceName[type] }}</strong>
        </li>
        <li class="flex items-center justify-between pb-sm">
          <span class="text-ants-text-3">合计费用：</span>
          <strong class="text-price"
            >{{ $root.priceUnit }} <span class="text-4xl">{{ nowPrice }}</span></strong
          >
        </li>
        <li class="flex items-center">
          <el-checkbox v-model="isRead">我已阅读并同意</el-checkbox>
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

export default {
  components: {
    AgreementDialog
  },
  props: {
    // 选中套餐
    plan: Object,
    // 购买类型 = m、s、y
    type: String,
    // 购买数量
    sum: Number
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
      if (this.plan.priceObj) {
        planPrice = this.plan.priceObj[this.type].value
      }
      price = planPrice * this.sum
      return (price / 100).toFixed(2)
    }
  },
  created() {},
  methods: {
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
      if (!this.plan.id) return this.$msg.error('请选择要套餐！')
      if (!this.type || !this.sum) return this.$msg.error('请选择购买时长！')

      if (!this.isRead) return this.$msg.warning('请阅读并同意服务协议')

      this.btnLoading = true
      const { data: res } = await doCreateOrder({
        // 订单类型，CDN套餐购买 = 10
        orderType: 10,
        // 选择套餐的 ID
        targetId: this.plan.id,
        // 构造的 JSON 数据 type = [m=月， s=季，y=年]， sum = 购买数量
        initJson: JSON.stringify({
          sum: this.sum,
          type: this.type
        })
      })
      this.btnLoading = false
      if (res.code !== 1) return

      // 前往确认订单页面
      if (res.data && res.data.serialNumber) {
        this.$msg.success('订单创建成功')
        this.$router.push({
          name: 'Order',
          params: { serialNumber: res.data.serialNumber }
        })
      }
    }
  }
}
</script>
