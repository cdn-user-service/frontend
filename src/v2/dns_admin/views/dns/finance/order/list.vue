<template>
  <el-card class="content-box animated fadeIn">
    <table-query-form
      :search-arr="[
        {
          name: '输入用户名搜索',
          key: 'users',
          value: queryInfo.users
        }
      ]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
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
          @click="getTableData"
          text="刷新"
        />
      </template>
    </table-query-form>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column prop="orderId" label="订单号" min-width="140">
      </ants-table-column>
      <ants-table-column prop="username" label="用户" min-width="130">
      </ants-table-column>

      <ants-table-column prop="productName" label="产品名称" min-width="140">
        <template #default="{ row }">
          <div v-if="row.goodsType == 1">余额充值</div>
          <div v-else-if="row.goodsType == 10 || row.goodsType == 11">
            <span>{{ row.productName }}</span>
            <span :class="row.goodsType == 11 ? 'text-success' : ''">
              （<span v-if="row.goodsType == 11">续费 </span>
              <span>{{ row.buySum }} </span>
              <span>{{ unitObj[row.productInfo.productUnit] }}</span
              >）
            </span>
          </div>
          <div v-else-if="row.goodsType == 12">
            {{ row.productName }}
            <span class="text-warning">（升级）</span>
          </div>

          <div v-else-if="row.goodsType == 13">
            <el-popover placement="top" width="400" trigger="click">
              <div>
                <strong>{{ antsT('增值业务订单详情') }}</strong>
              </div>
              <el-table :data="row.orderExtra.extra_info" style="margin:0;">
                <el-table-column prop="name" label="商品名称" width="120">
                </el-table-column>
                <el-table-column prop="value" label="规格" width="120">
                  <template #default="{ row }">
                    {{ row.value }} {{ row.unit }}
                  </template>
                </el-table-column>
                <el-table-column prop="price" label="价格" width="120">
                  <template #default="{ row }">
                    <span class="text-price">
                      {{ row.price | priceFormat }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
              <span slot="reference">
                <span class="cursor-pointer"
                  >增值业务（{{ row.buySum }} 年）</span
                >
                <span class="cursor-color text-primary el-icon-info"></span>
              </span>
            </el-popover>
          </div>
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
            已支付</span
          >
          <span v-else-if="row.status === 10" class="text-error el-icon-remove">
            待支付</span
          >
          <span v-else-if="row.status === 15" class="text-error el-icon-remove">
            待退款</span
          >
          <span
            v-else-if="row.status === 24"
            class="text-success el-icon-success"
          >
            退款完成</span
          >
          <span v-else>其他</span>
        </template>
      </ants-table-column>

      <ants-table-column prop="body" label="支付方式" min-width="100">
        <template #default="{ row }">
          <div v-if="row.orderResult">
            <el-tag size="small">{{
              payTypeObj[`payType_${row.orderResult.payType}`]
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
    </ants-table>
  </el-card>
</template>

<script>
// api
import { getOrderList } from '@/v2/dns_admin/api/dns/finance'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        start_date: '', // 开始日期
        end_date: '', // 结束日期

        users: '', // 搜索用户名
        goodsType: this.$route.meta.goodsType, // 产品类型 10 = dns套餐， 1 = 充值
        status: +this.$route.meta.status, // 支付状态 14 = 支付成功, 10 = 待支付， 24 = 退款完成
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
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
  },
  mounted() {
    this.getTableData()
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.meta': function(newVal, oldVal) {
      // 如果为充值记录
      this.queryInfo.status = newVal.status
      this.queryInfo.goodsType = newVal.goodsType

      this.queryInfo.page = 1
      this.tableData = []
      this.total = 0
      this.getTableData()
    }
  },
  methods: {
    /**
     * @description: 获取订单数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getOrderList(this.queryInfo)

      this.$root.loading = false

      if (res.code !== 1) return
      const obj = res.page || {}
      const orderArr = (obj.list || []).map(item => {
        return {
          username: item.userinfo
            ? item.userinfo.username ||
              item.userinfo.mail ||
              item.userinfo.mobile
            : item.userId,
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
      this.total = res.page.totalCount || 0
    }
  }
}
</script>
