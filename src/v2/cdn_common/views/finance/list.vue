<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="
          isAdmin
            ? [
                {
                  name: '检索订单号',
                  key: 'serialNumber',
                  value: queryInfo.serialNumber
                },
                {
                  name: '检索用户',
                  key: 'user',
                  value: queryInfo.user
                }
              ]
            : [
                {
                  name: '检索订单号',
                  key: 'serialNumber',
                  value: queryInfo.serialNumber
                }
              ]
        "
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            size="small"
            icon="el-icon-refresh"
            :loading="$root.loading"
            @click="getTableData"
            class="mr-sm"
            text="刷新"
          />
          <ants-select
            v-if="showDetail"
            size="small"
            style="width:100px;"
            v-model="queryInfo.orderType"
            @change="changeOrderType"
          >
            <ants-option label="全部" :value="allOrderType" />
            <ants-option label="套餐购买" value="10" />
            <ants-option label="套餐续费" value="11" />
            <ants-option label="套餐升级" value="13" />
            <ants-option label="增值服务" value="12" />
          </ants-select>
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column prop="serialNumber" label="订单号" min-width="140">
        </ants-table-column>

        <ants-table-column label="商品类型" min-width="140">
          <template #default="{ row }">
            <el-tag size="small" :type="orderTypeObj[row.orderType]">
              {{ orderType[row.orderType] }}
            </el-tag>

            <!-- 套餐购买 -->
            <span v-if="row.orderType == 10 && row.buyObj.sum">
              【{{ row.buyObj.sum }} {{ antsT(priceName[row.buyObj.type]) }}】
            </span>

            <!-- 套餐续费 -->
            <span class="text-success" v-else-if="row.orderType == 11">
              【{{ row.buyObj.sum }} {{ priceName[row.priceType] }}】
            </span>

            <!-- 增值服务 -->
            <span v-if="row.orderType == 12">
              【{{ row.buyObj.sum }} {{ antsT(priceName[row.buyObj.type]) }}】
            </span>
          </template>
        </ants-table-column>

        <ants-table-column prop="initJson" label="商品名称" min-width="140">
          <template #default="{ row }">
            {{ row.product && row.product.name }}
          </template>
        </ants-table-column>

        <ants-table-column prop="payable" label="订单金额" min-width="100">
          <template #default="{ row }">
            <span>{{ row.payable | priceFormat }}</span>
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="订单状态" min-width="100">
          <template #default="{ row }">
            <span
              v-if="orderStatusObj[row.status]"
              :class="orderStatusObj[row.status].class"
            >
              {{ antsT(orderStatusObj[row.status].name) }}</span
            >
          </template>
        </ants-table-column>

        <ants-table-column prop="body" label="支付方式" min-width="100">
          <template #default="{ row }">
            <el-tag size="small" v-if="row.payObject">{{
              antsT(payType[row.payObject.payType])
            }}</el-tag>
            <span v-else>-</span>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="createTime"
          label="订单创建时间"
          sortable
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column
          prop="user"
          label="用户"
          min-width="120"
          v-if="isAdmin"
        >
        </ants-table-column>

        <ants-table-column
          label="操作"
          width="210"
          align="right"
          key="10"
          v-if="showDetail"
        >
          <template #default="{ row }">
            <ants-button
              v-if="!isAdmin && queryInfo.status == 10"
              type="success"
              size="mini"
              @click="goOrderPage(row)"
              text="付款"
            />
            <ants-button
              type="primary"
              size="mini"
              @click="showDetailDialog(row)"
              text="详情"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="toDel(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 订单详情对话框 -->
    <DetailDialog ref="DetailDialogRef" :status-obj="orderStatusObj" />
  </div>
</template>

<script>
import { payType, priceName, orderType } from '@/global/enum'

import DetailDialog from './components/DetailDialog.vue'

const queryObj = {
  // 已支付
  14: {
    orderType: '10,11,12,13',
    status: 14
  },
  // 待支付
  10: {
    orderType: '10,11,12,13',
    status: 10
  },
  // 充值记录
  2: {
    orderType: '2',
    status: '14,10'
  },
  // 预付费
  30: {
    orderType: '30',
    status: 30
  },
  // 退款记录
  24: {
    orderType: '10,11,12,13',
    status: 24
  },
  // 待退款
  15: {
    orderType: '10,11,12,13',
    status: 15
  },
  // 实名认证
  1: {
    orderType: '1',
    status: 14
  }
}

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getOrderList,
  doDeleteOrder
} = require(`@/v2/${PROCESS_NAME}/api/cdn/finance`)

const orderStatusObj = {
  14: {
    name: ' 已支付',
    class: 'el-icon-success text-success'
  },
  10: {
    name: ' 待支付',
    class: 'el-icon-remove text-error'
  },
  15: {
    name: ' 待退款',
    class: 'el-icon-remove text-warning'
  },
  24: {
    name: ' 退款完成',
    class: 'el-icon-success text-success'
  },
  30: {
    name: ' 预付费',
    class: 'el-icon-remove text-warning'
  },
  other: {
    name: ' 其他',
    class: ''
  }
}
const orderTypeObj = {
  1: 'success',
  2: 'warning',
  10: 'primary',
  11: 'success',
  12: 'primary',
  13: 'warning',
  30: 'warning'
}

export default {
  components: {
    DetailDialog
  },
  data() {
    return {
      // 是否为管理端
      isAdmin: PROCESS_NAME === 'cdn_admin',

      total: 0,
      allOrderType: '',
      queryInfo: {
        start_date: '', // 开始日期
        end_date: '', // 结束日期

        // 检索订单号
        serialNumber: '',
        // 搜索用户名
        user: '',
        // 1 = 实名认证，2 = 充值， 10 = cdn 套餐， 11 = CDN 续费， 12 = 增值服务， 13 = 套餐升级
        orderType: '',
        // 支付状态 14 = 支付成功, 10 = 待支付， 24 = 退款完成
        status: '',
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],

      orderStatusObj,
      orderTypeObj,

      payType,
      priceName,
      orderType,
      showDetail: false
    }
  },
  created() {
    // this.getTableData()
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.query.type': {
      handler(newVal, oldVal) {
        const type = newVal || 14
        const query = queryObj[type]
        this.showDetail = type == 10 || type == 14

        this.queryInfo.status = query.status
        this.queryInfo.orderType = query.orderType
        this.allOrderType = query.orderType
        this.queryInfo.page = 1
        this.tableData = []
        this.total = 0
        this.getTableData()
      },
      immediate: true
    }
  },
  computed: {
  },
  methods: {
    changeOrderType(val) {
      this.getTableData()
    },
    /**
     * @description: 获取表格订单数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getOrderList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      this.total = obj.totalCount || 0

      const orderArr = (obj.list || []).map(item => {
        const initObj = (item.initJson && JSON.parse(item.initJson)) || {}
        let buyObj = {}
        let productObj = {}
        // 购买信息
        if (typeof initObj.buy_obj === 'object') {
          buyObj = initObj.buy_obj
        }
        if (typeof initObj.buy_obj === 'string' && initObj.buy_obj !== '') {
          buyObj = JSON.parse(initObj.buy_obj)
        }

        // 商品信息
        if (typeof initObj.product_obj === 'object') {
          productObj = initObj.product_obj
        }
        if (
          typeof initObj.product_obj === 'string' &&
          initObj.product_obj !== ''
        ) {
          productObj = JSON.parse(initObj.product_obj)
        }

        // 产品信息-预付费产品
        if (item.status == 30) {
          productObj = initObj
        }

        return {
          ...item,
          buyObj,
          productObj,
          // 续费用的
          priceType: initObj.type
        }
      })
      this.tableData = orderArr
    },

    // 删除订单
    async toDel(row) {
      const result = await this.$doDelete({
        tag: '订单'
      })
      if (!result) return

      // 发起请求
      const { data } = await doDeleteOrder({
        id: row.id
      })

      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
    },

    /**
     * @description: 点击订单详情
     */

    showDetailDialog(row = {}) {
      this.$refs.DetailDialogRef.showDialog(row)
    },

    /**
     * @description: 待支付前往付款
     */

    goOrderPage({ serialNumber }) {
      this.$router.push({
        name: 'Order',
        params: {
          serialNumber
        }
      })
    }
  }
}
</script>
