<template>
  <el-card class="content-box animated fadeIn">
    <table-query-form
      :search-arr="isAdmin ? [
         {
          name: '输入用户名搜索',
          key: 'username',
          value: queryInfo.username
        } 
      ] : []"
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
      <ants-table-column
        prop="refundId"
        label="退款订单号"
        min-width="120"
        key="refundId"
      >
      </ants-table-column>
      <ants-table-column
        prop="orderId"
        label="原始订单号"
        min-width="140"
        key="orderId"
      >
      </ants-table-column>

      <ants-table-column
        prop="goodsType"
        label="商品类型"
        min-width="120"
        key="goodsType"
      >
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="(goodsTypeObj[row.goodsType] || {}).type"
          >
            {{ (goodsTypeObj[row.goodsType] || {}).name || '-' }}
          </el-tag>
        </template>
      </ants-table-column>

      <ants-table-column
        prop="amount"
        label="退款金额"
        min-width="100"
        key="amount"
      >
        <template #default="{ row }">
          <span>{{ row.amount | priceFormat }}</span>
        </template>
      </ants-table-column>

      <ants-table-column
        prop="status"
        label="退款状态"
        min-width="100"
        key="status"
      >
        <template #default="{ row }">
          <span :class="statusClass[row.status]">
            {{ getPayStatus(row.status) }}
          </span>
        </template>
      </ants-table-column>

      <ants-table-column
        prop="createtime"
        label="申请时间"
        sortable
        min-width="140"
        key="createtime"
      >
      </ants-table-column>

      <ants-table-column
        prop="reason"
        label="申请退款原因"
        min-width="150"
        key="reason"
      >
      </ants-table-column>

      <ants-table-column
        prop="remark"
        label="退款说明"
        min-width="150"
        v-if="curPageType == 'refunded'"
        key="remark"
      >
      <template #default="{ row }">
        {{ row.remark || '-' }}
      </template>
      </ants-table-column>

      <ants-table-column
        prop="userId"
        label="用户"
        min-width="130"
        v-if="isAdmin"
        key="userId"
      >
      </ants-table-column>

      <ants-table-column
        label="操作"
        width="100"
        key="handle"
        v-if="isAdmin && curPageType == 'refunding'"
      >
        <template #default="{ row }">
          <ants-button
            type="primary"
            size="mini"
            @click="toRefund(row)"
            text="退款"
          />
        </template>
      </ants-table-column>
    </ants-table>

    <AgreeRefund
      ref="AgreeRefundRef"
      @refresh="getTableData"
    />
  </el-card>
</template>

<script>
// 组件
import AgreeRefund from './AgreeRefund.vue'
import { getPayStatus, getPayType } from '@/global/enum'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getRefundList } = require(`@/v2/${PROCESS_NAME}/api/dns/finance`)

// 订单状态类名
const statusClass = {
  // 待退款
  20: 'text-warning el-icon-remove',
  // 退款过期
  21: 'text-info el-icon-error',
  // 退款关闭
  22: 'text-info el-icon-error',
  // 退款失败
  23: 'text-error el-icon-remove',
  // 退款成功
  24: 'text-success el-icon-success'
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

export default {
  components: {
    AgreeRefund
  },
  props: {
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
        username: '',
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
      goodsTypeObj
    }
  },
  created() {
    console.log(this.$route)
  },
  mounted() {},
  watch: {
    // 监听路由地址参数的改变
    '$route.name': {
      handler(newVal, oldVal) {
        console.log('object', newVal)
        this.curPageType = newVal
        // 当前订单的查询参数
        const { status } = this.menuObj[newVal] || {}
        if (!status) return
        // 如果为充值记录
        this.queryInfo.status = status
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
        const { data: res } = await getRefundList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 后台前往退款
    toRefund(row = {}) {
      this.$refs.AgreeRefundRef.show({
        ...row,
        goodsType: (goodsTypeObj[row.goodsType] || {}).name
      })
    }
  }
}
</script>
