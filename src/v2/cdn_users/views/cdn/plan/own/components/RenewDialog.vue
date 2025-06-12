<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="套餐续费"
    width="700px"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="ants-tips_box">
      {{ antsT('注意：套餐续费费用根据最初购买套餐价格计算。') }}
    </div>
    <TitleBorder title="当前套餐" class="mb-df mt-xl" />
    <el-table :data="tableData" style="margin: 0" border>
      <ants-table-column prop="domain" label="绑定域名" align="center">
        <template #default="{ row }">
          <div>
            {{ antsT('绑定域名') }}（{{
              row.bindSiteList && row.bindSiteList.length
            }}）
          </div>
          <div class="mt-xs truncate-3">
            <el-tag
              size="mini"
              v-for="item in row.bindSiteList"
              :key="item"
              class="mr-xs"
            >
              {{ item }}
            </el-tag>
          </div>
        </template>
      </ants-table-column>
      <ants-table-column prop="goods" label="套餐名称" align="center">
        <template #default="{ row }">
          {{ row.product.name }}
        </template>
      </ants-table-column>
      <ants-table-column prop="endTime" label="到期时间" align="center">
      </ants-table-column>
    </el-table>

    <TitleBorder title="续费时长" class="mb-df mt-xl" />
    <div class="mt-lg">
      <span class="mr-lg text-ants-text-3">{{ antsT('购买方式') }}</span>
      <ants-radio-group v-model="form.type" size="small">
        <template v-for="(value, key) in priceUsbleObj">
          <ants-radio-button
            v-if="priceName[key]"
            :key="key"
            :label="key"
            :text="`按${priceName[key]}购买`"
          />
        </template>
      </ants-radio-group>
    </div>
    <div class="mt-xl">
      <span class="mr-lg text-ants-text-3">{{ antsT('购买数量') }}</span>
      <ants-input-number
        size="small"
        v-model="form.sum"
        :min="1"
        :max="10000"
      />
      <span class="ml-sm text-ants-text-3">{{
        antsT(priceName[form.type])
      }}</span>
    </div>
    <!-- 月、季、年 -->
  </ants-dialog>
</template>

<script>
// API
import { doCreateOrder } from '@/v2/cdn_users/api/payment'
import { priceName } from '@/global/enum'

export default {
  data() {
    return {
      dialogVisible: false,
      // 当前套餐数据
      tableData: [],
      form: {
        // 续费时长
        sum: 1,
        // 续费时长类型
        type: 'm'
      },

      priceName
    }
  },
  computed: {
    // 当前套餐开启哪些付费、月付、季付、年付
    priceUsbleObj() {
      const obj = {}
      let priceObj = {}
      if (this.tableData.length) {
        const productObj = this.tableData[0].productEntity || {}
        priceObj = productObj.productJson && JSON.parse(productObj.productJson)
      }
      Object.keys(priceObj).forEach((key) => {
        if (priceObj[key].status == 1) {
          obj[key] = priceObj[key]
        }
      })
      return obj
    }
  },
  watch: {
    // 监听选中商品可用价格
    priceUsbleObj: function (newVal, oldVal) {
      if (newVal.m) {
        this.form.type = 'm'
        return
      }
      if (newVal.s) {
        this.form.type = 's'
        return
      }
      if (newVal.y) {
        this.form.type = 'y'
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 对话框显示
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.$set(this.tableData, 0, {
        ...row
      })
    },

    /**
     * @description: 提交
     */

    async submitForm() {
      if (!this.form.sum || !this.form.type) {
        return this.$msg.error('请选择续费时长')
      }

      this.$refs.dialogRef.btnLoading = true
      const { id, serialNumber } = this.tableData[0]
      // 创建订单
      const { data: res } = await doCreateOrder({
        // 订单类型，CDN套餐续费 = 11
        orderType: 11,
        // 当前套餐的 ID
        targetId: id,
        // 构造的 JSON 数据 sum = 续费时长，格式 = {\"serialNumber\":\"1650361752071001\",\"sum\":1}
        initJson: JSON.stringify({
          serialNumber,
          sum: this.form.sum,
          type: this.form.type
        })
      })
      this.$refs.dialogRef.btnLoading = false
      if (res.code !== 1) return

      // 前往确认订单支付页面
      if (res.data && res.data.serialNumber) {
        this.dialogVisible = false
        this.$msg.success('订单创建成功')
        this.$router.push({
          name: 'Order',
          params: { serialNumber: res.data.serialNumber }
        })
      }
    },

    resetForm() {
      this.tableData[0].bindSiteList = []
      this.form.sum = 1
    }
  }
}
</script>
