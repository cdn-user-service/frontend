<template>
  <el-card class="content-box animated fadeIn">
    <table-query-form
      :search-arr="
        isAdmin
          ? [
              {
                name: '输入用户名搜索',
                key: 'users',
                value: queryInfo.users
              }
            ]
          : []
      "
      :queryInfo="queryInfo"
      @changeInput="getTableData"
      :show-date-picker="true"
      pagenumKey="cur_page"
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
      pagenumKey="cur_page"
      pagesizeKey="page_size"
    >
      <ants-table-column prop="orderId" label="订单号" min-width="140">
      </ants-table-column>

      <ants-table-column prop="goodsType" label="商品类型" min-width="140">
        <template #default="{ row }">
          <!-- DNS的类型跟CDN的不一样！！！ -->
          <el-tag size="small" :type="(goodsTypeObj[row.goodsType] || {}).type">
            {{ (goodsTypeObj[row.goodsType] || {}).name }}
          </el-tag>

          <!-- 套餐购买 -->
          <span v-if="row.goodsType == 10">
            【{{ row.buySum
            }}{{ antsT(priceUnitObj[row.productInfo.productUnit]) }}】
          </span>

          <!-- 套餐续费 -->
          <span v-if="row.goodsType == 11" class="text-success">
            【{{ row.buySum
            }}{{ antsT(priceUnitObj[row.productInfo.productUnit]) }}】
          </span>

          <!-- 增值业务 -->
          <span v-if="row.goodsType == 13">
            【{{ row.buySum }}{{ antsT('年') }}】
          </span>

          <!-- 证书购买、续费 -->
          <span v-if="row.goodsType == 20 || row.goodsType == 21">
            【{{ row.orderExtra.years }}{{ antsT('年') }}】
          </span>
        </template>
      </ants-table-column>

      <ants-table-column prop="productName" label="商品名称" min-width="140">
        <template #default="{ row }">
          <div v-if="row.goodsType == 20 || row.goodsType == 21">
            {{ row.orderExtra.productName }}
          </div>
          <div v-else>
            {{
              row.productInfo.productName || (row.goodsType == 1 ? '充值' : '-')
            }}
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
          <span :class="statusClass[row.status]">
            {{ getPayStatus(row.status) }}
          </span>
        </template>
      </ants-table-column>

      <ants-table-column prop="payType" label="支付方式" min-width="100">
        <template #default="{ row }">
          <el-tag size="small" v-if="row.payRecord.createtime">{{
            getPayType(row.payRecord.payType)
          }}</el-tag>
          <span v-else>-</span>
        </template>
      </ants-table-column>

      <ants-table-column
        prop="createtime"
        label="支付时间"
        sortable
        min-width="140"
      >
        <template #default="{ row }">
          {{ row.payRecord.createtime || '-' }}
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
        prop="username"
        label="用户"
        min-width="130"
        v-if="isAdmin"
      >
      </ants-table-column>

      <ants-table-column
        label="操作"
        width="120"
        v-if="!isAdmin && ['unpaid', 'paid'].includes(curPageType)"
      >
        <template #default="{ row }">
          <ants-button
            v-if="curPageType == 'unpaid'"
            type="primary"
            size="mini"
            icon="el-icon-wallet"
            @click="goOrderPage(row.orderId)"
            text="付款"
          />

          <template v-if="curPageType === 'paid'">
            <ants-button
              v-if="row.status === 14"
              type="primary"
              size="mini"
              @click="applyRefund(row)"
              text="申请退款"
            />
            <ants-button
              v-else-if="row.status == 15"
              type="info"
              size="mini"
              disabled
              text="退款中"
            />
            <ants-button
              v-else-if="row.status == 16"
              type="info"
              size="mini"
              disabled
              text="已退款"
            />
          </template>
        </template>
      </ants-table-column>
    </ants-table>

    <ApplyRefund ref="ApplyRefundRef" @refresh="getTableData" />
  </el-card>
</template>

<script>
// 组件
import ApplyRefund from './ApplyRefund.vue'
import { getPayStatus, getPayType } from '@/global/enum'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getOrderList } = require(`@/v2/${PROCESS_NAME}/api/dns/finance`)

// 订单状态类名
const statusClass = {
  // 待支付
  10: 'text-error el-icon-remove',
  // 已过期
  11: 'text-info el-icon-error',
  // 已关闭
  12: 'text-info el-icon-error',
  // 支付失败
  13: 'text-error el-icon-remove',
  // 支付成功
  14: 'text-success el-icon-success',
  // 支付成功后请求退款
  15: 'text-warning el-icon-remove',
  // 支付成功后退款完成
  16: 'text-success el-icon-success'
}

const goodsTypeObj = {
  1: {
    name: '余额充值',
    type: 'warning'
  },
  10: {
    name: '套餐购买',
    type: 'primary'
  },
  11: {
    name: '套餐续费',
    type: 'success'
  },
  12: {
    name: '套餐升级',
    type: 'warning'
  },
  13: {
    name: '增值业务',
    type: 'primary'
  },
  20: {
    name: '证书购买',
    type: 'primary'
  },
  21: {
    name: '证书续费',
    type: 'success'
  }
}

const priceUnitObj = {
  '1y': '年',
  '1s': '季',
  '1m': '月',
  '1d': '天',
  '1p': '次'
}
export default {
  components: {
    ApplyRefund
  },
  props: {
    // 查询参数
    menuObj: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      // 当前页面类型
      curPageType: '',
      total: 0,
      queryInfo: {
        start_date: '',
        end_date: '',
        users: '',
        // 产品类型
        goodsType: '',
        // 支付状态
        status: '',
        cur_page: 1,
        page_size: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],

      // 获取支付状态
      getPayStatus,
      statusClass,
      // 获取支付方式
      getPayType,
      // 商品类型
      goodsTypeObj,
      // 获取价格名称
      priceUnitObj
    }
  },
  created() {},
  mounted() {},
  watch: {
    // 监听路由地址参数的改变
    '$route.params.path': {
      handler(newVal, oldVal) {
        console.log('object', newVal)
        this.curPageType = newVal
        // 当前订单的查询参数
        const { status, goodsType } = this.menuObj[newVal] || {}
        if (!status) return
        this.queryInfo.status = status
        this.queryInfo.goodsType = goodsType
        this.queryInfo.cur_page = 1
        this.tableData = []
        this.total = 0
        this.getTableData()
      },
      // 立即触发
      immediate: true
    }
  },
  methods: {
    // 查询订单列表
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getOrderList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        const orderArr = (obj.list || []).map(item => {
          // 用户信息
          const userinfo = item.userinfo || {}
          return {
            username: userinfo
              ? userinfo.username || userinfo.mail || userinfo.mobile
              : item.userId,

            // 购买的产品信息
            productInfo: item.productInfo || {},
            // 支付信息
            payRecord: item.payRecord || {},
            // 订单额外信息
            orderExtra: JSON.parse(item.orderExtra || '{}'),
            // 订单号
            orderId: item.orderId,
            // 购买数量
            buySum: item.buySum,
            // 订单金额
            buyPayable: item.buyPayable,
            // 订单创建时间
            createtime: item.createtime,
            // 订单状态
            status: item.status,
            // 产品类型
            goodsType: item.goodsType,
            // 产品单价
            goodsUnitPrice: item.goodsUnitPrice
          }
        })
        console.log(orderArr)
        this.tableData = orderArr || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 待支付前往付款
    goOrderPage(orderId) {
      this.$router.push({ name: 'Order', params: { orderId } })
    },

    // 申请退款
    applyRefund(row = {}) {
      this.$refs.ApplyRefundRef.show({
        orderId: row.orderId,
        productName: row.productInfo.productName,
        goodsType: (goodsTypeObj[row.goodsType] || {}).name,
        buyPayable: row.buyPayable
      })
    }
  }
}
</script>
