<template>
  <div class="finance-order-box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :is-phone-top="false"
        :queryInfo="queryInfo"
        @changeInput="getGoodsList"
        pagenumKey="cur_page"
        :show-date-picker="true"
        startDateKey="start_date"
        endDataKey="end_date"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            size="small"
            icon="el-icon-refresh"
            :loading="$root.loading"
            @click="getGoodsList"
            text="刷新"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getGoodsList"
        :total="total"
        :queryInfo="queryInfo"
        pagenumKey="cur_page"
        pagesizeKey="page_size"
      >
        <ants-table-column
          prop="orderId"
          label="订单号"
          show-overflow-tooltip
          min-width="140"
        >
        </ants-table-column>
        <ants-table-column
          prop="productName"
          label="产品名称"
          show-overflow-tooltip
          min-width="140"
        >
          <template #default="{ row }">
            <div v-if="row.goodsType == 1">{{ antsT('余额充值') }}</div>

            <div v-else-if="row.goodsType == 10 || row.goodsType == 11">
              <span>{{ row.productName }}</span>
              <span :class="row.goodsType == 11 ? 'text-success' : ''">
                （<span v-if="row.goodsType == 11">{{ antsT('续费') }} </span>
                <span>{{ row.buySum }}</span>
                <span>{{ antsT(unitObj[row.productInfo.productUnit]) }}</span
                >）
              </span>
            </div>

            <div v-else-if="row.goodsType == 12">
              {{ row.productName }}
              <span class="warn_color">（{{ antsT('升级') }}）</span>
            </div>

            <ExtraPopover
              v-else-if="row.goodsType == 13"
              :order-row-extra-info="row.orderExtra.extra_info"
              :buy-sum="row.buySum"
            />
          </template>
        </ants-table-column>

        <ants-table-column prop="buyPayable" label="订单金额" min-width="100">
          <template #default="{ row }">
            <span>{{ row.buyPayable | priceFormat }}</span>
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="订单状态" min-width="100">
          <template #default="{ row }">
            <span v-if="row.status === 14" class="text-success el-icon-success">
              {{ antsT('已支付') }}</span
            >
            <span
              v-else-if="row.status === 10"
              class="text-error el-icon-remove"
            >
              {{ antsT('待支付') }}</span
            >
            <span
              v-else-if="row.status === 24"
              class="text-success el-icon-success"
            >
              {{ antsT('退款完成') }}</span
            >
            <span v-else>{{ antsT('其他') }}</span>
          </template>
        </ants-table-column>

        <ants-table-column prop="body" label="支付方式" min-width="100">
          <template #default="{ row }">
            <div v-if="row.orderResult">
              <el-tag size="small">{{
                antsT(payTypeObj[`payType_${row.orderResult.payType}`])
              }}</el-tag>
            </div>
            <div v-else>
              --
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="createtime"
          label="订单创建时间"
          sortable
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column
          label="操作"
          width="100"
          v-if="queryInfo.status == 10"
        >
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              icon="el-icon-wallet"
              @click="goOrderPage(row.orderId)"
              text="付款"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
import { getOrderList } from '@/v2/dns_users/api/dns/finance'
import ExtraPopover from './ExtraPopover'

export default {
  components: {
    ExtraPopover
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        start_date: '', // 开始日期
        end_date: '', // 结束日期

        goodsType: this.$route.meta.goodsType, // 产品类型 10 = dns套餐， 1 = 充值
        status: +this.$route.meta.status, // 支付状态 14 = 支付成功, 10 = 待支付， 24 = 退款完成
        cur_page: 1, // 当前的页数
        page_size: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],

      unitObj: {
        '1y': '年',
        '1s': '季',
        '1m': '月',
        '1d': '天',
        '1p': '次'
      },

      payTypeObj: {
        payType_0: '余额支付',
        payType_1: '人工充值',
        payType_2: '支付宝支付',
        payType_3: '微信支付'
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.meta': function(newVal, oldVal) {
      // 如果为充值记录
      this.queryInfo.status = newVal.status
      this.queryInfo.goodsType = newVal.goodsType

      this.queryInfo.cur_page = 1
      this.tableData = []
      this.total = 0
      this.getGoodsList()
    }
  },
  methods: {
    /**
     * @description: 获取订单数据
     */

    async getGoodsList() {
      this.$root.loading = true
      const { data: res } = await getOrderList(this.queryInfo)

      this.$root.loading = false

      if (res.code !== 1) return
      const obj = res.data || {}
      const orderArr = (obj.list || []).map(item => {
        return {
          orderId: item.orderId,
          orderResult: JSON.parse(item.orderResult),
          orderExtra: JSON.parse(item.orderExtra),
          productInfo: item.productInfo,
          productName: item.productInfo && item.productInfo.productName,
          createtime: item.createtime,
          buySum: item.buySum,
          buyPayable: item.buyPayable,
          goodsType: item.goodsType,
          status: item.status
        }
      })
      this.tableData = orderArr || []
      this.total = res.data.totalCount || 0
    },

    // 待支付前往付款
    goOrderPage(orderId) {
      this.$router.push({ name: 'Order', params: { orderId } })
    }
  }
}
</script>
<style lang="scss">
.finance-order-box {
  .head_box {
    .el-card__body {
      padding: 10px 20px;
    }
    .hcard_box {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-left: 50px;
    }
  }
}
</style>
<style lang="scss" scoped>
.card_head {
  color: #fff;
  cursor: pointer;
  .span_card {
    font-size: 40px;
    width: 30%;
    line-height: 40px;
    text-align: center;
    border-right: 1px solid #eee;
  }
  .div_card {
    width: 60%;
    font-size: 14px;
    .p_num {
      font-weight: 700;
      font-size: 16px;
      margin: 15px 0;
      line-height: 20px;
    }
  }
}
</style>
