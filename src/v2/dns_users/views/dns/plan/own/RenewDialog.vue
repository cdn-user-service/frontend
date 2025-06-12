<template>
  <el-dialog
    title="套餐续费"
    :visible.sync="renewDialogVisible"
    width="600px"
    @close="renewResetForm"
    class="ants_dialog"
    center
  >
    <div style="width:100%;">
      <div class="ants-tips_box">
        <span class="el-icon-info"></span>
        {{ antsT('套餐续费费用根据最初购买套餐价格计算。') }}
      </div>
      <div class="my-lg">
        <div class="mb-sm font-bold">{{ antsT('当前套餐') }}</div>
        <el-table :data="renewTableData" style="margin:0;" border>
          <ants-table-column prop="domain" label="绑定域名" align="center">
            <template #default="{ row }">
              {{ row.domain || '未绑定' }}
            </template>
          </ants-table-column>
          <ants-table-column prop="goods" label="套餐" align="center">
            <template #default="{ row }">
              {{ row.name.productName }}
            </template>
          </ants-table-column>
          <ants-table-column
            prop="effectEndTime"
            label="到期时间"
            align="center"
          >
          </ants-table-column>
        </el-table>
      </div>
      <div class="my-xl">
        <div class="mb-sm font-bold">
          <span class="mr-sm">{{ antsT('续费时长') }}</span>
        </div>
        <el-input-number
          v-model="renewTime"
          :precision="0"
          :step="1"
          :min="1"
          @change="changeRenewTime"
        ></el-input-number>
        <span v-if="renewTableData[0].name.productUnit == '1y'"> 年</span>
        <span v-if="renewTableData[0].name.productUnit == '1s'"> 季</span>
        <span v-if="renewTableData[0].name.productUnit == '1m'"> 月</span>
        <span v-if="renewTableData[0].name.productUnit == '1d'"> 天</span>
        <span v-if="renewTableData[0].name.productUnit == '1p'"> 次</span>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <ants-button
        type="info"
        size="small"
        @click="renewDialogVisible = false"
        text="取 消"
      />
      <ants-button
        type="primary"
        size="small"
        @click="createRenewOrder"
        :loading="btnLoading"
        text="下一步"
      />
    </span>
  </el-dialog>
</template>

<script>
// api
import { createRenewal } from '@/v2/dns_users/api/dns/plan'
export default {
  data() {
    return {
      // 续费套餐数据
      btnLoading: false,
      renewDialogVisible: false,
      renewTableData: [
        {
          name: {}
        }
      ],
      renewTime: 1
    }
  },
  methods: {
    /** -------------------------------------------------------------------------------------
     * @description: 点击续费
     * @param {*} row
     */
    showRenewMeal(row) {
      this.renewTableData[0] = row
      this.renewDialogVisible = true
    },

    /**
     * @description: 点击下一步，创建续费订单
     */

    async createRenewOrder() {
      if (this.renewTime < 1) {
        return this.$msg.error(this.antsT('请选择续费时长！'))
      }

      this.btnLoading = true
      const { data: res } = await createRenewal({
        couponId: 0, // 优惠券ID，TODO：暂时没有
        cousumeId: this.renewTableData[0].id, // 要续费的套餐ID
        sum: this.renewTime // 续费时长
      })
      this.btnLoading = false
      if (res.code !== 1) return

      // 前往订单页面
      if (res.data.orderId) {
        this.goOrderPage(res.data.orderId)
      }
    },

    // 前往确认订单页面
    goOrderPage(orderId) {
      this.$msg.success(this.antsT('订单创建成功'))
      this.$router.push({
        name: 'Order',
        params: { orderId }
      })
    },

    /**
     * @description: 续费时长改变，保证数值不为空
     * @param {*} currentValue
     * @param {*} oldValue
     * @return {*}
     */

    changeRenewTime(currentValue, oldValue) {
      if (!currentValue) {
        this.$nextTick(() => {
          this.renewTime = 1
        })
      }
    },

    // 续费对话框关闭重置
    renewResetForm() {
      this.btnLoading = false
    }
  }
}
</script>
