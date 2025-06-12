<template>
  <ants-dialog
    title="套餐升级"
    v-model="dialogVisible"
    width="650px"
    ref="dialogRef"
    @closed="resetForm"
  >
    <div style="width:100%;" v-loading="dialogLoading">
      <div class="ants-tips_box">
        <span class="el-icon-info"></span>
        <span class="text-sm">
          {{
            antsT(
              '套餐升级仅需补充差价，不影响套餐到期时间，升级后请确认 DNS 服务器是否配置正确。'
            )
          }}
        </span>
      </div>
      <div class="mt-lg">
        <!-- <div class="margin-bottom-sm text-bold">{{antsT('当前套餐')}}</div> -->
        <TitleBorder title="当前套餐" class="mb-lg" />

        <el-table :data="upgradeTableData" style="margin:0;" border>
          <ants-table-column prop="domain" label="绑定域名" align="center">
            <template #default="{ row }">
              {{ row.domain || antsT('未绑定') }}
            </template>
          </ants-table-column>
          <ants-table-column prop="goods" label="套餐" align="center">
            <template #default="{ row }">
              {{ row.productName }}
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
      <div class="my-lg">
        <TitleBorder title="选择升级套餐" class="mb-lg">
          <!-- <router-link to="/dns-vas" class="ml-sm">{{
            antsT('查看套餐对比')
          }}</router-link> -->
        </TitleBorder>

        <!-- <div class="margin-bottom-sm">
            <span class="text-bold margin-right-sm">{{antsT('选择升级套餐')}}</span>
            <router-link to="/dns-vas">{{antsT('查看套餐对比')}}</router-link>
          </div> -->
        <div v-if="!planList.length" class="text-error">
          {{ antsT('暂无可升级套餐，请联系管理员') }}
        </div>
        <el-radio-group v-else v-model="upgradeMealId" size="medium">
          <el-radio-button
            :label="item.id"
            v-for="item in planList"
            :key="item.id"
          >
            <div>{{ item.productName }}</div>
          </el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="isFreeMeal" class="mb-lg">
        <TitleBorder class="my-lg" title="购买时长" />
        <div>
          <el-radio-group v-model="sum" size="medium">
            <el-radio-button v-for="item in timeList" :key="item" :label="item">
              {{ item }}
              <span> 年</span>
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <span slot="footer">
      <ants-button
        type="info"
        size="small"
        @click="dialogVisible = false"
        text="取 消"
      />
      <ants-button
        type="primary"
        size="small"
        @click="createUpgradeOrder"
        :loading="btnLoading"
        :disabled="!planList.length"
        text="下一步"
      />
    </span>
  </ants-dialog>
</template>

<script>
// api
import {
  createOrder,
  createUpgrade,
  getProductList
} from '@/v2/dns_users/api/dns/plan'

export default {
  name: 'UpgradeDialog',
  props: {
    // 当前产品数据
    // upgradeTableData: {
    //   type: Array,
    //   default: () => []
    // }
  },
  data() {
    return {
      btnLoading: false,
      dialogLoading: false,
      upgradeMealId: null,
      dialogVisible: false,
      upgradeTableData: [],
      planList: [],

      // 仅免费套餐
      isFreeMeal: false,
      // 选中购买时长
      sum: 1,
      // 购买时长数组
      timeList: [1, 2, 3, 5, 10]
    }
  },
  created() {},
  methods: {
    /**
     * @description: 点击升级，展示对话框，获取套餐列表数据
     * @param {*} row
     */
    async getMealList(row) {
      this.upgradeTableData[0] = row
      // 判断是否为免费套餐的域名
      this.isFreeMeal = row.productUnitPrice <= 0

      this.dialogVisible = true

      // 获取套餐列表，并过滤价格比当前价格高的套餐
      this.dialogLoading = true
      const { data: res } = await getProductList({
        pagenum: 1,
        pagesize: 20
      })
      this.dialogLoading = false

      if (res.code !== 1) return
      const obj = res.data || {}
      // 过滤套餐,同类型、且价格更大的
      const arr = (obj.list || []).filter(item => {
        return (
          item.productUnit === row.productUnit &&
          item.productUnitPrice > row.productUnitPrice
        )
      })
      if (arr.length) {
        this.upgradeMealId = arr[0].id
      }
      this.planList = arr || []
    },

    createUpgradeOrder() {
      this.isFreeMeal
        ? this.createFreeUpgradeOrder()
        : this.createPriceUpgradeOrder()
    },

    /**
     * @description: 套餐升级，点击下一步生成升级套餐，前往确认订单页面
     */
    async createPriceUpgradeOrder() {
      if (!this.upgradeMealId) {
        return this.$msg.error(this.antsT('请选择升级套餐'))
      }

      this.btnLoading = true
      const { data: res } = await createUpgrade({
        couponId: 0, // 优惠券ID，TODO：暂时没有
        cousumeId: this.upgradeTableData[0].id, // 当前套餐ID
        productId: this.upgradeMealId, // 选择要升级的套餐ID
        orderExtra: JSON.stringify({
          // 升级的额外参数，TODO
          product_server_id: -1, // server服务组ID，-1代表后端自动分配
          product_id: this.upgradeMealId,
          domain: this.upgradeTableData[0].domain, // 绑定域名
          extra_info: []
        })
      })
      this.btnLoading = false
      if (res.code !== 1) return
      const orderId = (res.data || {}).orderId

      // 前往订单页面
      if (orderId) {
        this.$msg.success(this.antsT('订单创建成功'))
        this.$router.push({
          name: 'Order',
          params: { orderId }
        })
      }
    },

    /**
     * @description: 免费套餐升级套餐
     */

    async createFreeUpgradeOrder() {
      if (!this.upgradeMealId) {
        return this.$msg.error(this.antsT('请选择升级套餐'))
      }

      this.btnLoading = true
      // 构造产品额外参数
      const orderExtra = JSON.stringify({
        // product_server_id: this.activeMeal.productServerGroupId, // server服务组ID
        product_server_id: -1, // server服务组ID，-1代表后端自动分配
        product_id: this.upgradeMealId,
        domain: this.upgradeTableData[0].domain, // 绑定域名
        extra_info: []
      })

      const { data: res } = await createOrder({
        productId: this.upgradeMealId, // 产品ID
        sum: this.sum, // 购买数量，有购买几年属性，所以要乘以年
        orderExtra: orderExtra, // 产品属性内容，JSON格式的数据
        couponId: 1 // 优惠券，暂时不用管
      })

      this.btnLoading = false
      if (res.code !== 1) return
      const orderId = (res.data || {}).orderId

      this.$router.push({
        name: 'Order',
        params: { orderId }
      })
    },

    // 升级对话框重置
    resetForm() {
      this.upgradeMealId = null
      this.dialogLoading = false
      this.btnLoading = false
    }
  }
}
</script>
