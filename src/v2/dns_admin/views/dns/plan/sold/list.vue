<template>
  <div class="meal_box">
    <el-card class="content-box animated fadeIn">
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
          <el-button
            type="success"
            size="small"
            icon="el-icon-refresh"
            :loading="$root.loading"
            @click="getTableData"
          >{{ antsT('刷新') }}</el-button>
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
        <ants-table-column
          type="expand"
          label="#"
          width="40"
        >
          <template #default="{ row }">
            <div class="p-lg bg-ants-bg-2">
              <div class="pb-lg flex items-center">
                <div
                  class="border border-ants-border-2 py-xs px-lg mr-lg"
                  :class="modeObj['mode_' + queryInfo.key].type + '_meal_tag'"
                  style="border-radius:30px;"
                >
                  <span class="font-semibold text-df mr-sm el-icon-s-shop">
                    {{ row.name.productName }}</span>

                  <span>{{ row.effectStartTime }} ~ {{ row.effectEndTime }}</span>
                </div>

                <!-- <router-link to="/dns-vas" style="text-decoration: underline;"
                  >查看套餐对比</router-link
                > -->
              </div>
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
                    ></span>
                    <span v-else>{{ item.attrValue }} {{ item.attrUnit }}</span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          label="ID"
          prop="id"
          min-width="60"
        >
        </ants-table-column>

        <ants-table-column
          label="绑定域名数"
          prop="domain"
          min-width="100"
        >
          <template #default="{ row }">
            {{ `${row.usedDomainSum || 0} / ${row.maxDomainSum || 0}` }}
          </template>
        </ants-table-column>

        <ants-table-column
          label="套餐名称"
          prop="name"
          min-width="140"
        >
          <template #default="{ row }">
            {{ (row.name || {}).productName }}
          </template>
        </ants-table-column>

        <ants-table-column
          label="套餐价格"
          prop="price"
          min-width="130"
        >
          <template #default="{ row }">
            <div v-if="row.name">
              {{ row.name.productUnitPrice | priceFormat }}
              <span>/{{ unitObj[row.name.productUnit] }}</span>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          label="生效时间"
          prop="effectStartTime"
          min-width="140"
        >
          <template #default="{ row }">
            <span :class="modeObj['mode_' + queryInfo.key].class">{{
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
            <span :class="modeObj['mode_' + queryInfo.key].class">{{
              row.effectEndTime
            }}</span>
          </template>
        </ants-table-column>
        <ants-table-column
          label="状态"
          min-width="60"
        >
          <template>
            <el-tag
              size="mini"
              :type="modeObj['mode_' + queryInfo.key].type"
            >
              {{ modeObj['mode_' + queryInfo.key].name }}</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column
          label="用户"
          prop="userId"
          min-width="140"
        >
          <template #default="{ row }">
            <div>ID：{{ row.userId }}</div>
            <div v-if="row.userInfo">
              {{ row.userInfo.username || row.userInfo.mail }}
            </div>
          </template>
        </ants-table-column>
        <ants-table-column
          label="操作"
          width="150"
        >
          <template #default="{ row }">
            <div v-if="queryInfo.key == 4">
              <ants-button
                type="danger"
                size="mini"
                @click="deleteMeal(row)"
                text="删除"
              />
            </div>

            <ants-button
              v-else
              type="info"
              size="mini"
              text="删除"
              disabled
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
// api
import { getSoldList } from '@/v2/dns_admin/api/dns/plan'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        user: '', // 搜索框内容
        key: this.$route.meta.mode, // 套餐类型 0 = 所有, 1 = 正在使用, 2 = 未使用, 3 = 已过期, 4 = 已失效
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
          name: '正常',
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
    '$route.meta.mode': function (newVal, oldVal) {
      // 如果为充值记录
      this.queryInfo.key = newVal

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
        const { data: res } = await getSoldList(this.queryInfo)
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
     */

    showRenewMeal(row) {
      //   this.$refs.RenewDialogRef.showRenewMeal(row)
    },

    /** -------------------------------------------------------------------------------------
     * @description: 点击升级，展示对话框，获取套餐列表数据
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

    /** -------------------------------------------------------------------------------------
     * @description: 删除
     */
    async deleteMeal({ name, id }) {
      //   const result = await this.$doDelete({
      //     name: name.productName,
      //     tag: '已失效套餐'
      //   })
      //   if (!result) return
      //   // 发起请求
      //   const { data: res } = await doDeleteUserMeal({
      //     id: id
      //   })
      //   if (res.code !== 1) return
      //   this.getTableData()
      //   this.$msg.success('已成功删除已失效套餐：' + name.productName)
    }
  }
}
</script>
<style lang="scss">
.meal_box {
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
