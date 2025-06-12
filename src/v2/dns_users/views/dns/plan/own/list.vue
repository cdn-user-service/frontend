<template>
  <div class="plan-own-box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索套餐名称',
            key: 'domain',
            value: queryInfo.domain
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
            @click="goBuyMeal()"
            text="购买DNS套餐"
          />
        </template>
      </table-query-form>

      <!-- 表格 -->
      <ants-table
        :data="tableData"
        empty-text="没有任何套餐数据！"
        :row-key="rowKey"
        :total="total"
        :queryInfo="queryInfo"
        @getTableData="getTableData"
      >
        <ants-table-column type="expand" label="#" width="40">
          <template #default="{ row }">
            <div class="p-lg bg-ants-bg-2">
              <div class="pb-lg flex items-center">
                <div
                  class="border border-ants-border-2 py-xs px-lg mr-lg"
                  :class="modeObj['mode_' + queryInfo.mode].type + '_meal_tag'"
                  style="border-radius:10px;"
                >
                  <span class="font-bold text-df mr-sm el-icon-s-shop">
                    {{ row.name.productName }}</span
                  >

                  <span
                    >{{ row.effectStartTime }} ~ {{ row.effectEndTime }}</span
                  >
                </div>

                <!-- <router-link
                  to="/dns-vas"
                  style="text-decoration: underline;"
                >{{ antsT('查看套餐对比') }}</router-link> -->
              </div>
              <div class="rounded-2xl p-df bg-ants-bg-1">
              <el-row :gutter="20">
                <el-col
                  :span="8"
                  v-for="item in JSON.parse(row.name.productJson)"
                  :key="item.id"
                >
                  <div class="my-sm">
                    <span
                      class="text-ants-text-4 mr-xs inline-block"
                      style="min-width:90px;"
                      >{{ item.attrKeyName }}:
                    </span>
                    <span
                      v-if="item.attrType == 'bool'"
                      class="el-icon-success text-success"
                    >支持</span>
                    <span v-else>{{ item.attrValue }} {{ item.attrUnit }}</span>
                  </div>
                </el-col>
              </el-row>
              </div>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="ID" prop="id" min-width="60">
        </ants-table-column>

        <ants-table-column label="绑定域名数" prop="domain" min-width="100">
          <template #default="{ row }">
            {{ `${row.maxDomainSum || 0} / ${row.usedDomainSum || 0}` }}
          </template>
        </ants-table-column>

        <ants-table-column label="套餐名称" prop="name" min-width="140">
          <template #default="{ row }">
            {{ (row.name || {}).productName }}
          </template>
        </ants-table-column>

        <ants-table-column label="套餐价格" prop="price" min-width="130">
          <template #default="{ row }">
            <div v-if="row.name">
              {{ row.name.productUnitPrice | priceFormat }}
              <span> /{{ antsT(unitObj[row.name.productUnit]) }}</span>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          label="生效时间"
          prop="effectStartTime"
          min-width="140"
        >
          <template #default="{ row }">
            <span :class="modeObj['mode_' + queryInfo.mode].class">{{
              row.effectStartTime
            }}</span>
          </template>
        </ants-table-column>
        <ants-table-column
          label="到期时间"
          prop="effectEndTime"
          min-width="140"
        >
          <template #default="{ row }">
            <span :class="modeObj['mode_' + queryInfo.mode].class">{{
              row.effectEndTime
            }}</span>
          </template>
        </ants-table-column>
        <ants-table-column label="状态" min-width="60">
          <template>
            <el-tag size="mini" :type="modeObj['mode_' + queryInfo.mode].type">
              {{ antsT(modeObj['mode_' + queryInfo.mode].name) }}</el-tag
            >
          </template>
        </ants-table-column>
        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <div v-if="queryInfo.mode == 4">
              <ants-button
                type="danger"
                size="mini"
                @click="deleteMeal(row)"
                text="删除"
              />
            </div>

            <div v-else>
              <ants-button
                type="success"
                size="mini"
                @click="showRenewMeal(row)"
                text="续费"
              />
              <ants-button
                type="warning"
                class="price-button"
                size="mini"
                @click="showUpgradeDialog(row)"
                text="升级"
              />
            </div>
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 续费对话框 -->
    <RenewDialog ref="RenewDialogRef" />
    <UpgradeDialog ref="UpgradeDialogRef" />
  </div>
</template>

<script>
// api
import {
  getList,
  createUpgrade,
  getProductList,
  doDeleteUserMeal
} from '@/v2/dns_users/api/dns/plan'

import UpgradeDialog from '@/v2/dns_users/components/UpgradeDialog'
import RenewDialog from './RenewDialog'

// 验证提示实名认证、绑定手机号
import { showTipsAlert } from '@/v2/dns_users/extra/computed'
export default {
  components: {
    RenewDialog,
    UpgradeDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        domain: '', // 搜索框内容
        mode: this.$route.meta.mode, // 套餐类型 0 = 所有, 1 = 正在使用, 2 = 未使用, 3 = 已过期, 4 = 已失效
        pagenum: 1, // 当前的页数
        pagesize: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],

      unitObj: {
        '1y': '年',
        '1s': '季',
        '1m': '月',
        '1d': '天',
        '1p': '次'
      },

      modeObj: Object.freeze({
        mode_1: {
          name: '使用中',
          type: 'primary',
          class: 'primary'
        },
        mode_2: {
          name: '未使用',
          type: 'success',
          class: 'success_color'
        },
        mode_3: {
          name: '已过期',
          type: 'warning',
          class: 'warn_color'
        },
        mode_4: {
          name: '已失效',
          type: 'danger',
          class: 'error_color'
        }
      })
    }
  },
  created() {
    this.getTableData()
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.meta.mode': function(newVal, oldVal) {
      // 如果为充值记录
      this.queryInfo.mode = newVal

      this.queryInfo.pagenum = 1
      this.tableData = []
      this.total = 0
      this.getTableData()
    }
  },
  methods: {
    rowKey(row) {
      return row.id
    },

    /**
     * @description: 获取我的套餐数据
     * TODO: 没有分页
     */

    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getList(this.queryInfo)
        this.$root.loading = false
        if (res.code !== 1) return
        const obj = (res.data || {}).paid || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    /**
     * @description: 点击续费
     * @param {*} row
     */

    showRenewMeal(row) {
      this.$refs.RenewDialogRef.showRenewMeal(row)
    },

    /** -------------------------------------------------------------------------------------
     * @description: 点击升级，展示对话框，获取套餐列表数据
     * @param {*} row
     */
    async showUpgradeDialog(row) {
      this.$refs.UpgradeDialogRef.getMealList({
        id: row.id,
        domain: row.domain,
        productName: row.name.productName,
        productUnit: row.name.productUnit,
        productUnitPrice: row.name.productUnitPrice,
        effectEndTime: row.effectEndTime
      })
    },

    /** -------------------------------------------------------------------------------------
     * @description: 删除
     * @param {*} row
     */
    async deleteMeal({ name, id }) {
      const result = await this.$doDelete({
        name: name.productName,
        tag: '已失效套餐'
      })
      if (!result) return

      // 发起请求
      const { data: res } = await doDeleteUserMeal({
        id: id
      })
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除已失效套餐：' + name.productName)
    },

    /**
     * @description: 前往购买DNS套餐
     */

    goBuyMeal() {
      // 先判断 用户是否已实名认证、已绑定手机号
      const { isUnverified, isUnboundMobile } = this.$attrs
      if (
        showTipsAlert({
          isUnverified,
          isUnboundMobile,
          tag: '购买DNS套餐'
        })
      ) {
        return
      }

      this.$router.push({ name: 'PurchasePlans', params: { type: 1 } })
    }
  }
}
</script>
<style lang="scss">
.plan-own-box {
  .ants-table__expanded-cell[class*='cell'] {
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
}
</style>
