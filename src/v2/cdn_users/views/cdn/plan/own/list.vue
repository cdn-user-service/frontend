<template>
  <div class="plan-own-box">
    <el-card class="box-card animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索套餐名称',
            key: 'key',
            value: queryInfo.key
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="warning"
            class="price-button"
            size="small"
            icon="el-icon-plus"
            :disabled="buyBtnLoading"
            @click="goBuyPlan()"
            text="购买CDN套餐"
          />
        </template>
      </table-query-form>

      <!-- 表格 -->
      <ants-table
        :data="tableData"
        :empty-text="antsT('没有任何套餐数据！')"
        row-key="id"
        :total="total"
        :queryInfo="queryInfo"
        @getTableData="getTableData"
        @expand-change="onExpandChange"
        :expand-row-keys="expandRowKeys"
      >
        <ants-table-column type="expand" label="#" width="40">
          <template #default="{ row }">
            <div class="p-lg bg-ants-bg-2">
              <div class="pb-sm" style="max-height: 300px; overflow-y: auto">
                <div class="font-bold mb-df">
                  {{ antsT('绑定域名') }}（{{
                    (row.bindSiteList || []).length
                  }}）
                </div>
                <el-tag
                  size="small"
                  type="primary"
                  v-for="item in row.bindSiteList"
                  :key="item"
                  class="mr-sm mb-sm"
                >
                  {{ item }}
                </el-tag>
              </div>

              <el-tag type="success" v-if="row.attr.charging_mode == 1">
                {{ antsT('有效期') }}：{{ row.startTime }} ~
                {{ row.endTime }}
              </el-tag>
              <PlanUsed
                class="space-y-5"
                :used-obj="row.consume"
                :attr-obj="row.attr"
                :show-flow-progress="false"
              />
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="ID" prop="id" width="60"> </ants-table-column>

        <ants-table-column label="套餐名称" prop="name" min-width="140">
          <template #default="{ row }">
            {{ row.product.name }}
          </template>
        </ants-table-column>

        <ants-table-column label="计费方式" min-width="140">
          <template #default="{ row }">
            <div>
              <el-tag size="mini" type="primary">
                {{
                  antsT(
                    row.attr.charging_mode &&
                      getBillName(row.attr.charging_mode)
                  )
                }}
              </el-tag>
            </div>
            <div v-if="row.attr.charging_mode == 1">
              {{ antsT('流量月包') }}：
              <strong>
                {{ flowUnit(row.attr.flow) }}
              </strong>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="套餐单价" prop="price" min-width="130">
          <template #default="{ row }">
            <template v-if="row.product.status == 4">
              <el-tag
                size="mini"
                class="mr-sm"
                :type="
                  (row.product.productJson.v || {}).status
                    ? 'success'
                    : 'danger'
                "
              >
                {{
                  (row.product.productJson.v || {}).status ? '启用' : '禁用'
                }}</el-tag
              >
              <template v-if="(row.product.productJson.v || {}).status">
                有效期：
                <strong
                  >{{ (row.product.productJson.v || {}).value }} 个月</strong
                >
              </template>
            </template>

            <template v-else>
              <div v-if="row.attr.charging_mode == 1">
                <template v-for="(item, key) in row.product.productJson">
                  <div :key="key" v-if="priceName[key]" class="my-1">
                    <el-tag size="mini" type="success" v-if="item.status == 1">
                      {{ item.value | priceFormat }} /
                      {{ antsT(priceName[key]) }}
                    </el-tag>
                  </div>
                </template>
              </div>

              <el-tag
                size="mini"
                type="primary"
                v-else-if="
                  row.attr.charging_mode == 2 || row.attr.charging_mode == 3
                "
              >
                {{ row.attr.bandwidth | priceFormat }}/{{ antsT('Mbps/月') }}
              </el-tag>
            </template>
          </template>
        </ants-table-column>

        <ants-table-column
          label="使用情况"
          width="250"
          v-show="queryInfo.mode == 1"
        >
          <template #default="{ row }">
            <FlowProgress
              v-if="row.attr.charging_mode == 1"
              :used="+row.consume.flow"
              :total="+row.attr.flow"
            />
            <!-- <BandwidthChart
              :serial-number="row.serialNumber"
              :chart-data="row.currentMonthData"
              v-else-if="
                row.attr.charging_mode == 2 || row.attr.charging_mode == 3
              "
            /> -->
          </template>
        </ants-table-column>

        <ants-table-column
          label="到期时间"
          min-width="140"
          prop="endTime"
          align="center"
        >
        </ants-table-column>

        <!-- <ants-table-column label="有效期" min-width="200">
          <template #default="{ row }">
            {{ row.startTime }} ~ {{ row.endTime }}
          </template>
        </ants-table-column> -->

        <ants-table-column label="状态" min-width="60" align="center">
          <template #default="{ row }">
            <span class="text-success el-icon-success" v-if="row.status == 1">
              {{ antsT('正常') }}</span
            >
            <span v-else class="text-error el-icon-error">
              {{ antsT('禁用') }}</span
            >
          </template>
        </ants-table-column>

        <ants-table-column label="增值业务" width="100">
          <template #default="{ row }">
            <span class="text-primary cursor-color" @click="showVasDialog(row)">
              <i class="el-icon-tickets" />
              {{ antsT('查看') }}
            </span>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" align="right" width="120">
          <template #default="{ row }">
            <el-dropdown
              placement="bottom"
              :show-timeout="100"
              @command="handleMore"
            >
              <ants-button
                type="primary"
                size="mini"
                style="padding: 7px 9px"
                text="操作"
                :disabled="btnLoading"
              >
                <i class="el-icon-caret-bottom el-icon--right" />
              </ants-button>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item, key) in {
                    toRenew: row.attr.charging_mode == 1 ? '续费' : null,
                    toUpgrade: row.attr.charging_mode == 1 ? '升级' : null,
                    toUsage: row.status == 1 ? '用量' : null,
                    toDel: row.attr.charging_mode == 1 ? '注销' : null,
                    toCheckout:
                      row.attr.charging_mode == 2 || row.attr.charging_mode == 3
                        ? '结算'
                        : null
                  }"
                  :key="key"
                  :command="handleCommand(key, row)"
                  >{{ antsT(item) }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 续费对话套餐框 -->
    <RenewDialog ref="RenewDialogRef" />

    <!-- 设计套餐对话框 -->
    <UpgradeDialog ref="UpgradeDialogRef" />

    <BandwidthChartDialog ref="BandwidthChartDialog" />

    <!-- 增值业务对话框 -->
    <VasDialog ref="VasDialogRef" />
  </div>
</template>

<script>
// API
import {
  getPlanSuitList,
  doCancellationPlan,
  doLiquidationPlan,
  getPlanAll,
  getPlanSuitDetail
} from '@/v2/cdn_users/api/cdn/plan'

import RenewDialog from './components/RenewDialog'
import UpgradeDialog from './components/UpgradeDialog'
import VasDialog from './components/VasDialog.vue'

import BandwidthChart from '@/v2/cdn_common/components/Plan/BandwidthChart'
import BandwidthChartDialog from '@/v2/cdn_common/components/BandwidthChartDialog'

import FlowProgress from '@/v2/cdn_common/components/Plan/FlowProgress'
import PlanUsed from '@/v2/cdn_common/components/Plan/Used'

import { getBillName, priceName } from '@/global/enum'

// 验证提示实名认证、绑定手机号
import { showTipsAlert } from '@/v2/cdn_users/extra/computed'
import { flowUnit } from '@/utils/unit'

export default {
  components: {
    PlanUsed,
    RenewDialog,
    UpgradeDialog,
    FlowProgress,
    // BandwidthChart,
    BandwidthChartDialog,
    VasDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        // 10，11 = 套餐、套餐续费， 12 = 增值业务
        productTypes: '10,11',
        // 检索套餐名称
        key: '',
        // 套餐类型 0 = 所有, 1 = 正在使用, 2 = 未使用, 3 = 已过期, 4 = 已失效
        mode: this.$route.query.mode || 1,
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      expandRowKeys: [],

      tableData: [],
      // 计费方式
      getBillName,
      // 价格名称
      priceName,

      // 可购买套餐数量
      allPlanTotal: 0,
      buyBtnLoading: false
    }
  },
  computed: {},
  created() {
    this.getPlanAllData()
    this.getTableData()
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.query.mode': function (newVal, oldVal) {
      // 如果为充值记录
      this.queryInfo.mode = newVal || 1
      this.queryInfo.page = 1
      this.tableData = []
      this.total = 0
      this.getTableData()
    }
  },
  methods: {
    flowUnit,
    /**
     * @description: 获取我的套餐数据
     */

    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getPlanSuitList(this.queryInfo)

        if (res.code !== 1) return
        const obj = res.data || {}
        const arr = (obj.list || []).map((item) => {
          const productEntity = item.productEntity || {}

          const product = {
            name: productEntity.name,
            productJson: {},
            status: productEntity.status
          }

          // 解析原始产品价格
          if (productEntity.productJson) {
            product.productJson = JSON.parse(productEntity.productJson)
          }

          const { consume = {}, usedTypeDetail = {} } = item
          return {
            ...item,
            product,
            attr: item.attr || {},
            consume: {
              ...consume,
              // 已使用流量
              flow: usedTypeDetail.totalFlowGb || 0
            }
          }
        })
        this.tableData = arr
        this.total = (res.data || {}).totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 展开行查询套餐详情
    async onExpandChange(row, expandedRows) {
      console.log('展开行', row, expandedRows)
      // 如果为展开，且没有展开过
      if (!row.expanded) {
        const { data: res } = await getPlanSuitDetail({
          serialNumber: row.serialNumber
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        row.expanded = true
        row.bindSiteList = obj.bindSiteList || []
        row.consume = obj.consume || {}
      }
    },

    /**
     * @description: 获取所有可购买套餐列表，用判断 购买CDN套餐按钮是否隐藏
     */

    async getPlanAllData() {
      this.buyBtnLoading = true
      const { data: res } = await getPlanAll({
        productTypes: 10
      })
      this.buyBtnLoading = false
      if (res.code !== 1) return
      if (!res.data.length) {
        this.allPlanTotal = 0
        return
      }
      let sum = 0
      res.data.forEach((item) => {
        const mode = (item.attr || {}).charging_mode
        if (mode == '1') {
          sum += 1
        }
      })
      this.allPlanTotal = sum
    },

    showBandwidth(row = {}) {
      this.$refs.BandwidthChartDialog.showDialog(row)
    },

    /**
     *  点击更多下拉框
     */
    // 获取下拉框指令参数，用于自定义参数
    handleCommand(method, row) {
      return {
        method,
        row
      }
    },

    // 选择更多下拉框内容
    handleMore({ method, row }) {
      this[method](row)
    },

    /**
     * @description: 前往用量查询
     */

    toUsage({ serialNumber }) {
      this.$router.push({ path: '../usage', query: { serialNumber } })
    },

    /**
     * @description: 点击续费
     * @param {*} row
     */

    toRenew(row = {}) {
      this.$refs.RenewDialogRef.showDialog(row)
    },

    /** -------------------------------------------------------------------------------------
     * @description: 点击升级，展示对话框，获取套餐列表数据
     * @param {*} row
     */
    async toUpgrade(row = {}) {
      this.$refs.UpgradeDialogRef.showDialog(row)
    },

    /**
     * @description: 查看增值业务
     */

    showVasDialog(row = {}) {
      this.$refs.VasDialogRef.showDialog(row)
    },

    /**
     * @description: 结算后付费套餐
     */

    async toCheckout({ serialNumber, productEntity }) {
      const result = await this.$doDelete({
        content: `该操作将注销套餐：【${productEntity.name}】，并扣除费用。是否继续？`,
        title: '注销套餐'
      })
      if (!result) return

      this.btnLoading = true
      const { data: res } = await doLiquidationPlan({
        SerialNumber: serialNumber
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('注销成功')
    },

    /** -------------------------------------------------------------------------------------
     * @description: 删除
     * @param {*} row
     */
    async toDel(row = {}) {
      const result = await this.$doDelete({
        content: `该操作将永久注销套餐：【${row.productEntity.name}】，注销后不可恢复，是否继续？`,
        title: '永久注销套餐'
      })
      if (!result) return
      this.btnLoading = true
      // 发起请求
      const { data: res } = await doCancellationPlan({
        SerialNumber: row.serialNumber
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('注销套餐成功')
    },

    /**
     * @description: 前往购买DNS套餐
     */

    goBuyPlan() {
      if (this.allPlanTotal === 0) {
        return this.$router.push('/cdn/plan/purchase')
      }

      // 坚持是否提示实名认证和绑定手机号
      const { isUnverified, isUnboundMobile } = this.$attrs
      if (
        showTipsAlert({
          isUnverified,
          isUnboundMobile,
          tag: '购买套餐'
        })
      ) {
        return
      }

      this.$router.push({ name: 'Purchase' })
    }
  }
}
</script>
<style lang="scss">
.plan-own-box {
  .primary_meal_tag {
    color: theme('colors.primary');
    border-color: theme('colors.primary');
  }
  .success_meal_tag {
    color: theme('colors.success');
    border-color: theme('colors.success');
  }
  .warning_meal_tag {
    color: theme('colors.warning');
    border-color: theme('colors.warning');
  }
  .danger_meal_tag {
    color: theme('colors.error');
    border-color: theme('colors.error');
  }

  .el-table__body-wrapper {
    padding-top: 100px;
    margin-top: -100px;
  }

  .el-table .cell {
    overflow: visible;
  }
}
</style>
