<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="套餐升级"
    width="700px"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="ants-tips_box">
      {{ antsT('注意：套餐升级仅需补充差价，不影响套餐到期时间。') }}
    </div>
    <TitleBorder title="当前套餐" class="mb-df mt-xl" />
    <el-table :data="tableData" style="margin:0;" border>
      <ants-table-column prop="domain" label="绑定域名" align="center">
        <template #default="{ row }">
          <div>{{ antsT('绑定域名') }}（{{ row.bindSiteList && row.bindSiteList.length }}）</div>
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

    <TitleBorder title="选择升级套餐" class="mb-df mt-xl" />
    <ants-radio-group size="small" v-model="targetId" v-if="enabedPlan.length">
      <ants-radio-button
        v-for="item in enabedPlan"
        :key="item.id"
        :label="item.id"
        :text="item.name"
      />
    </ants-radio-group>
    <span v-else class="text-error">
      {{ antsT('暂无可升级套餐！') }}
    </span>
  </ants-dialog>
</template>

<script>
// API
import { doCreateOrder } from '@/v2/cdn_users/api/payment'
import { getCanUpdatePlanList } from '@/v2/cdn_users/api/cdn/plan'

export default {
  data() {
    return {
      dialogVisible: false,
      // 当前套餐数据
      tableData: [],
      // 可升级套餐数据
      enabedPlan: [],
      // 当前选中要升级的套餐ID
      targetId: null
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

      this.getEnabedPlan()
    },

    /**
     * @description: 获取可升级的套餐列表
     */

    async getEnabedPlan() {
      this.$refs.dialogRef.bodyLoading = true
      const obj = this.tableData[0].productEntity || {}
      const { data: res } = await getCanUpdatePlanList({
        productId: obj.id
      })
      this.$refs.dialogRef.bodyLoading = false
      if (res.code !== 1) return
      this.enabedPlan = res.data || []
      if (!this.enabedPlan.length) return this.$msg.error('暂无可升级套餐！')
      this.targetId = this.enabedPlan[0].id
    },

    /**
     * @description: 提交
     */

    async submitForm() {
      if (!this.targetId) return this.$msg.error('请选择升级套餐')

      this.$refs.dialogRef.btnLoading = true
      const { serialNumber } = this.tableData[0]
      // 创建订单
      const { data: res } = await doCreateOrder({
        // 订单类型，CDN套餐升级 = 13
        orderType: 13,
        // 当前选中要升级套餐的 ID
        targetId: this.targetId,
        // 构造的 JSON 数据 serialNumber = 当前套餐的订单号
        initJson: JSON.stringify({ serialNumber })
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
      this.targetId = null
    }
  }
}
</script>
