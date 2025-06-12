<template>
  <div class="meal_box">
    <el-card class="animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索用户',
            key: 'user',
            value: queryInfo.user
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            size="small"
            icon="el-icon-refresh"
            :loading="$root.loading"
            :disabled="btnLoading"
            @click="getTableData"
            text="刷新"
          />
        </template>
      </table-query-form>

      <!-- 表格 -->
      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        row-key="id"
        :total="total"
        :queryInfo="queryInfo"
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

        <ants-table-column label="ID" prop="id" min-width="60">
        </ants-table-column>

        <ants-table-column label="套餐名称" prop="name" min-width="140">
          <template #default="{ row }">
            {{ row.product && row.product.name }}
          </template>
        </ants-table-column>

        <ants-table-column label="计费方式" min-width="120">
          <template #default="{ row }">
            <div>
              <el-tag size="mini" type="primary">
                {{
                  row.attr.charging_mode && getBillName(row.attr.charging_mode)
                }}
              </el-tag>
            </div>
            <div v-if="row.attr.charging_mode == 1">
              流量月包：
              <strong>{{ flowUnit(row.attr.flow) }} </strong>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="套餐价格" prop="price" min-width="130">
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
                <template v-for="(value, key) in row.product.productJson">
                  <div v-if="priceName[key]" :key="key" class="my-1">
                    <el-tag size="mini" type="success" v-if="value.status == 1">
                      {{ `${priceName[key]}费：`
                      }}{{ value.value | priceFormat }}
                    </el-tag>
                  </div>
                </template>
              </div>

              <el-tag
                size="mini"
                type="success"
                v-else-if="
                  row.attr.charging_mode == 2 || row.attr.charging_mode == 3
                "
              >
                {{ row.attr.bandwidth | priceFormat }}/Mbps/月
              </el-tag>
            </template>
          </template>
        </ants-table-column>

        <ants-table-column
          label="使用情况"
          width="250"
          v-if="queryInfo.mode == 1"
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

        <ants-table-column label="到期时间" min-width="150" prop="endTime">
          <template #default="{ row }">
            {{ row.endTime }}

            <!-- <UpdateTimePopover @refreshData="getTableData" :row-data="row" /> -->
          </template>
        </ants-table-column>

        <ants-table-column label="用户" prop="userId" min-width="120">
          <template #default="{ row }">
            <div>ID：{{ row.userId }}</div>
             <!-- 修改: 添加对 row.username 的空值检查 -->
             <ants-copy :text="row.username || ''" />
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="状态" min-width="60">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#F52443"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
              v-if="queryInfo.mode == 1"
            />

            <div v-else>
              <span class="text-success el-icon-success" v-if="row.status == 1">
                正常</span
              >
              <span v-else class="text-error el-icon-error"> 禁用</span>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="增值业务" width="90">
          <template #default="{ row }">
            <span class="text-primary cursor-color" @click="showVasDialog(row)">
              <i class="el-icon-tickets" />
              查看
            </span>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="210">
          <template #default="{ row }">
            <!-- <div v-if="queryInfo.key == 4"> -->
            <!-- <ants-button
              type="info  "
              size="mini"
              @click="forbidPlan(row)"
              :disabled="btnLoading"
              text="禁用"
            /> -->

            <ants-button
              type="primary"
              size="mini"
              :disabled="btnLoading"
              @click="showUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              v-if="row.attr.charging_mode == 1"
              type="info"
              size="mini"
              @click="deletePlan(row)"
              :disabled="btnLoading"
              text="注销"
            />

            <ants-button
              v-else-if="
                row.attr.charging_mode == 2 || row.attr.charging_mode == 3
              "
              type="info"
              size="mini"
              @click="liquidationPlan(row)"
              :disabled="btnLoading"
              text="注销"
            />

            <ants-button
              type="success"
              class="price-btn"
              size="mini"
              :disabled="btnLoading"
              @click="goUsagePage(row)"
              text="用量"
            />
            <!-- </div> -->
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 增值业务详情对话框 -->
    <VasDialog ref="VasDialogRef" />

    <!-- 修改已售套餐对话框 -->
    <UpdateDialog ref="UpdateDialogRef" @refresh="getTableData" />
  </div>
</template>

<script>
// api
import {
  getSuitList,
  doCancellationPlan,
  doForbidPlan,
  doLiquidationPlan,
  getSuitDetail
} from '@/v2/cdn_admin/api/cdn/product'

// 产品参数数据
import { getBillName, priceName } from '@/global/enum'
import PlanUsed from '@/v2/cdn_common/components/Plan/Used'
import FlowProgress from '@/v2/cdn_common/components/Plan/FlowProgress'

// import BandwidthChart from '@/v2/cdn_common/components/Plan/BandwidthChart'
import VasDialog from './VasDialog.vue'
import UpdateDialog from './UpdateDialog.vue'
import { flowUnit } from '@/utils/unit'
// import UpdateTimePopover from './UpdateTimePopover.vue'

export default {
  components: {
    PlanUsed,
    FlowProgress,
    // BandwidthChart,
    VasDialog,
    UpdateDialog
    // UpdateTimePopover
  },
  data() {
    return {
      flowUnit,
      total: 0,
      queryInfo: {
        user: '', // 搜索框内容
        userIds: '', // 搜索框内容
        // 订单号
        serialNumber: '',
        // 开始时间
        startTime: 0,
        // 到期时间
        endTime: '',
        mode: this.$route.query.mode || '1', // 套餐类型 0 = 所有, 1 = 正在使用, 2 = 未使用, 3 = 已过期, 4 = 已失效
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      btnLoading: false,
      expandRowKeys: [],

      // 计费方式
      getBillName,
      // 价格类型名称
      priceName
    }
  },
  computed: {},
  created() {
    this.getTableData()
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.query.mode': function (newVal, oldVal) {
      // 如果为充值记录
      this.queryInfo.mode = newVal || '1'

      this.queryInfo.page = 1
      this.tableData = []
      this.total = 0
      this.getTableData()
    }
  },
  methods: {
    /**
     * @description: 获取我的套餐数据
     * TODO: 没有分页
     */

    async getTableData() {
      this.$root.loading = true

      try {
        const { data: res } = await getSuitList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        const arr = (obj.list || []).map((item) => {
          const productEntity = item.productEntity || {}
          const product = {
            name: productEntity.name || '', // 确保有默认值
            productJson: {},
            status: productEntity.status || 0 // 确保有默认值
          }

          // 解析原始产品价格
          if (productEntity.productJson) {
            try {
              product.productJson = JSON.parse(productEntity.productJson)
            } catch (error) {
              console.error('Failed to parse productJson:', error)
              product.productJson = {} // 设置为空对象以防解析失败
            }
          }
  
          const { consume = {}, usedTypeDetail = {} } = item

          return {
            ...item,
            product,
            attr: item.attr || {},
            consume: {
              ...consume,
              flow: usedTypeDetail.totalFlowGb || 0
            }
          }
        })
        this.tableData = arr
        this.total = obj.totalCount || 0
      } catch (error) {
        console.error('Error fetching table data:', error)
      } finally {
        this.$root.loading = false
      }
    },

    // 展开行查询套餐详情
    async onExpandChange(row, expandedRows) {
      console.log('展开行', row, expandedRows)
      // 如果为展开，且没有展开过
      if (!row.expanded) {
        const { data: res } = await getSuitDetail({
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
     * @description: 点击续费
     * @param {*} row
     */

    showRenewMeal(row) {
      //   this.$refs.RenewDialogRef.showRenewMeal(row)
    },

    /**
     * @description: 修改已售产品对话框显示
     */

    showUpdateDialog(row = {}) {
      // if (row.status != 1) return this.$msg.error('请先启用套餐')
      this.$refs.UpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 前往用量查询
     */

    goUsagePage({ serialNumber, userId, username }) {
      this.$router.push({
        path: '../usage',
        query: { userId, username, serialNumber }
      })
    },

    /**
     * @description: 查看增值业务
     */

    showVasDialog(row = {}) {
      this.$refs.VasDialogRef.showDialog(row)
    },

    /** -------------------------------------------------------------------------------------
     * @description: 点击升级，展示对话框，获取套餐列表数据
     * @param {*} row
     */
    async showUpgradeDialog(row) {
      //   this.$refs.UpgradeDialogRef.getMealList({
      //     id: row.id,
      //     domain: row.domain,
      //     productName: row.name.productName,
      //     productUnit: row.name.productUnit,
      //     productUnitPrice: row.name.productUnitPrice,
      //     effectEndTime: row.effectEndTime
      //   })
    },

    /**
     * @description: 禁用套餐
     */

    /**
     * @description: 启动=禁用套餐
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          content: `该操作将禁用套餐：【${row.productEntity.name}】【用户：${row.username}】。是否继续？`,
          title: '禁用套餐'
        })
        if (!result) {
          row.status = 1
          return
        }
      }

      this.$refs[switchRef].loading = true
      const { data: res } = await doForbidPlan({
        SerialNumber: row.serialNumber,
        status: row.status
      })
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }

      this.$msg.success('操作成功')
    },

    /**
     * @description: 结算后付费套餐
     */

    async liquidationPlan({ serialNumber, productEntity, username }) {
      const result = await this.$doDelete({
        content: `该操作将注销套餐：【${productEntity.name}】【用户：${username}】。并扣除用户费用。是否继续？`,
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
     */
    async deletePlan(row) {
      const result = await this.$doDelete({
        content: `该操作将永久注销套餐：【${row.productEntity.name}】【用户：${row.username}】，注销后不可恢复，是否继续？`,
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
    }
  }
}
</script>
<style lang="less">
.meal_box {
  .el-table__expanded-cell[class*='cell'] {
    padding: 0;
  }
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
