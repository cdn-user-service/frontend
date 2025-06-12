<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索绑定域名',
            key: 'key',
            value: queryInfo.key
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getGoodsList"
      >
        <template slot="buttons">
          <ants-button
            type="warning"
            size="small"
            class="price-button"
            icon="el-icon-plus"
            @click="goBuyMeal()"
            text="购买增值业务"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="goodsList"
        :empty-text="antsT('您还没有任何增值业务，立即购买享受更多服务')"
        @getTableData="getGoodsList"
        :total="total"
        :queryInfo="queryInfo"
      >
        <!-- <ants-table-column
              type="selection"
              align="center"
              width="45"
              :selectable="isCheckca"
            ></ants-table-column> -->
        <ants-table-column label="ID" prop="id" min-width="60">
        </ants-table-column>

        <ants-table-column label="商品规格" prop="guige" min-width="300">
          <template #default="{ row }">
            <ul>
              <li
                class="flex items-center "
                v-for="item in JSON.parse(row.productExtra)"
                :key="item.id"
              >
                <span
                  class="inline-block text-ants-text-4"
                  style="min-width:60px;"
                  >{{ item.name }}：</span
                >
                <span class="inline-block" style="min-width:60px;">
                  {{ item.value }} {{ item.unit }}
                </span>

                <span class="pl-df text-ants-text-4">价格：</span>
                <span class="text-price">{{ item.price | priceFormat }}</span>
              </li>
            </ul>
          </template>
        </ants-table-column>

        <ants-table-column label="绑定域名" prop="domain" min-width="140">
        </ants-table-column>

        <ants-table-column
          label="生效时间"
          prop="effectStartTime"
          min-width="140"
        >
        </ants-table-column>
        <ants-table-column
          label="到期时间"
          prop="effectEndTime"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column label="操作" width="100">
          <template #default="{ row }">
            <ants-button
              type="danger"
              size="mini"
              @click="doDeleteGoods(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
// api
import { getUserExtraList } from '@/v2/dns_users/api/dns/plan'

// 验证提示实名认证、绑定手机号
import { showTipsAlert } from '@/v2/dns_users/extra/computed'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        key: '', // 搜索框内容
        pagenum: 1, // 当前的页数
        pagesize: 20 // 当前每页显示多少条数据
      },
      goodsList: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      this.$root.loading = true
      const { data: res } = await getUserExtraList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      this.goodsList = res.data.list || []
      this.total = res.data.totalCount || 0
    },

    /**
     * @description: 前往购买增值业务页面
     */

    goBuyMeal() {
      // 先判断 用户是否已实名认证、已绑定手机号
      const { isUnverified, isUnboundMobile } = this.$attrs
      if (
        showTipsAlert({
          isUnverified,
          isUnboundMobile,
          tag: '购买增值业务'
        })
      ) {
        return
      }

      this.$router.push({ name: 'PurchaseVas' })
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async doDeleteGoods(row) {
      const result = await this.$doDelete({
        tag: '增值业务'
      })
      if (!result) return
      this.$msg.warning(this.antsT('暂不支持删除增值业务功能'))
    },

    handleSelectionChange(val) {}
  }
}
</script>
