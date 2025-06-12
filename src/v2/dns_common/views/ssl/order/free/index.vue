<template>
  <div>
    <el-card class="content-box">
      <!-- <el-row :gutter="20" slot="header">
        <el-col :span="4" v-for="(item, key) in sumObj" :key="key">
          <div
            class="rounded-2xl py-df px-lg bg-ants-bg-4"
            v-loading="loading"
            element-loading-spinner="el-icon-loading"
          >
            <div class="font-semibold pb-df">
              {{ item.name }}
            </div>
            <div :class="item.color" class="text-4xl">
              {{ item.value }}
            </div>
          </div>
        </el-col>
      </el-row> -->

      <el-tabs
        v-model="queryInfo.sslEndTimes"
        @tab-click="toQuery()"
        class="-mt-sm mb-xs"
      >
        <el-tab-pane
          v-for="(item, key) in sumObj"
          :key="key"
          :label="item.name"
          :name="item.time"
        >
          <span slot="label">
            {{ item.name }}
            (<span :class="item.color"> {{ item.value }} </span
            >)
          </span>
        </el-tab-pane>
      </el-tabs>

      <table-query-form
        :search-arr="
          isAdmin
            ? [
                {
                  name: '检索域名',
                  key: 'domain',
                  value: queryInfo.domain
                },
                {
                  name: '检索用户',
                  key: 'users',
                  value: queryInfo.users
                }
              ]
            : [
                {
                  name: '检索域名',
                  key: 'domain',
                  value: queryInfo.domain
                }
              ]
        "
        pagenumKey="cur_page"
        :show-date-picker="true"
        startDateKey="start_date"
        endDataKey="end_date"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            size="small"
            icon="el-icon-refresh"
            text="刷新"
            :disabled="$root.loading"
            :loading="loading"
            @click="toQuery()"
          />
          <!-- <ants-button
            v-if="!isAdmin"
            type="primary"
            size="small"
            icon="el-icon-plus"
            text="申请证书"
            :disabled="$root.loading"
            :loading="loading"
            @click="toApply()"
          /> -->

          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            text="申请免费证书"
            :disabled="$root.loading"
            :loading="loading"
            @click="toCreate()"
          />
        </template>
        <template slot="inputs">
          <ants-select
            v-model="queryInfo.sslStatus"
            size="small"
            placeholder="请选择"
            style="width: 150px; margin-right: 10px"
            @change="toQuery"
          >
            <ants-option label="全部" value="all" />
            <ants-option label="申请成功" :value="2" />
            <ants-option label="申请失败" :value="0" />
            <ants-option label="申请中" :value="1" />
            <ants-option label="需添加TXT记录" :value="3" />
            <ants-option label="需添加CNAME记录" :value="4" />
          </ants-select>
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange"
        :total="total"
        :queryInfo="queryInfo"
        pagenumKey="cur_page"
        pagesizeKey="page_size"
      >
        <ants-table-column
          type="selection"
          width="45"
          align="center"
          key="0"
        ></ants-table-column>
        <ants-table-column prop="name" label="证书类型" min-width="140">
          <template #default="{ row }">
            {{ row.goodsType == 23 ? 'ZeroSSL' : 'Letsencrypt' }}
          </template>
        </ants-table-column>

        <ants-table-column prop="domains" label="绑定域名" min-width="180">
          <template #default="{ row }">
            <el-tooltip placement="right-start">
              <div class="inline-block">
                <span>
                  {{ row.orderExtra.domainArr[0] }}
                </span>
                <span
                  class="text-primary font-semibold"
                  v-if="row.orderExtra.domainArr.length > 1"
                >
                  +{{ row.orderExtra.domainArr.length - 1 }}
                </span>
                <ants-copy icon :text="row.orderExtra.domainArr.join('\n')" />
              </div>

              <div slot="content" style="min-width: 140px">
                <div class="font-semibold pb-xs">
                  {{ antsT('绑定域名') }}【{{
                    row.orderExtra.domainArr.length
                  }}】
                </div>
                <el-scrollbar>
                  <ul class="space-y-2" style="max-height: calc(100vh - 400px)">
                    <li v-for="item in row.orderExtra.domainArr" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                </el-scrollbar>
              </div>
            </el-tooltip>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="orderId"
          label="订单号"
          min-width="200"
          sortable="custom"
        >
        </ants-table-column>

        <ants-table-column
          prop="createtime"
          label="申请日期"
          min-width="140"
          sortable="custom"
        >
        </ants-table-column>

        <ants-table-column
          prop="endDate"
          label="到期日期"
          min-width="140"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ row.acmeVo.endDate || '-' }}
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="状态" min-width="120">
          <template #default="{ row, $index }">
            <template v-if="row.acmeVo.status == 3 || row.acmeVo.status == 4">
              <VerifyPopover
                v-show="row.isCheck"
                :orderId="row.orderId"
                :textRecords="row.textRecords"
                :text="row.acmeVo.status == 3 ? 'TXT' : 'CNAME'"
                :value="row.isCheck"
              />

              <el-tooltip
                v-show="!row.isCheck"
                placement="top"
                content="点击查看详情"
              >
                <span
                  class="cursor-pointer"
                  @click="getSslCertDetail(row, $index)"
                >
                  {{
                    antsT(
                      row.loading
                        ? '加载中...'
                        : `需添加${
                            row.acmeVo.status == 3 ? 'TXT' : 'CNAME'
                          }记录`
                    )
                  }}
                  <i class="el-icon-info text-primary"></i>
                </span>
              </el-tooltip>
            </template>

            <div class="relative" v-else-if="row.acmeVo.status == 0">
              <el-tooltip
                v-show="row.isCheck"
                placement="left-start"
                effect="dark"
              >
                <span class="text-error cursor-pointer"
                  >{{ antsT('申请失败') }}
                  <i class="el-icon-info"></i>
                </span>

                <div
                  slot="content"
                  class="overflow-y-auto"
                  style="max-height: 80vh"
                  v-loading="row.loading"
                >
                  <pre>
                  {{ row.errorMsg }}
                 </pre
                  >
                </div>
              </el-tooltip>

              <el-tooltip
                v-show="!row.isCheck"
                placement="top"
                content="点击查看详情"
              >
                <span
                  class="text-error cursor-pointer"
                  @click="getSslCertDetail(row, $index)"
                >
                  {{ antsT(row.loading ? '加载中...' : '申请失败') }}
                  <i class="el-icon-info"></i>
                </span>
              </el-tooltip>
            </div>

            <span v-else-if="row.acmeVo.status == 2" class="text-success">
              {{ antsT('申请成功') }}
            </span>

            <span v-else-if="row.acmeVo.status == 1" class="text-warning">
              {{ antsT('申请中') }}
            </span>
          </template>
        </ants-table-column>

        <ants-table-column prop="user" label="用户" width="180" v-if="isAdmin">
          <template #default="{ row }">
            <div>ID：{{ row.userId }}</div>
            <div v-if="(row.userinfo || {}).username">
              <ants-copy :text="row.userinfo.username" />
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="180" align="left">
          <template #default="{ row }">
            <div class="text-df flex items-center" :key="row.orderId">
              <span
                v-if="row.acmeVo.status == 2"
                class="text-primary cursor-pointer"
                @click="toDetail(row)"
                >详情
              </span>
              <span v-else class="text-ants-text-5 cursor-not-allowed">
                详情
              </span>
              <el-divider direction="vertical" />
              <span
                class="text-primary cursor-pointer"
                :class="{ 'cursor-not-allowed': btnLoading }"
                @click="toReSign(row)"
                >重签
              </span>
              <el-divider direction="vertical" />
              <span
                class="text-primary cursor-pointer"
                :class="{ 'cursor-not-allowed': btnLoading }"
                @click="toDel(row)"
                >删除
              </span>
            </div>
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- <ApplyDialog ref="ApplyDialogRef" @refresh="toQuery" /> -->

    <CreateDialog ref="CreateDialogRef" @refresh="toQuery" />

    <DetailDialog ref="DetailDialogRef" />

    <!-- 证书重签对话框 -->
    <ReSignDialog ref="ReSignDialogRef" @refresh="getTableData" />
  </div>
</template>

<script>
import { CERT_STATUS } from '../cert-params'
// import ApplyDialog from './ApplyDialog'
import DetailDialog from './DetailDialog'
import VerifyPopover from './VerifyPopover'
import CreateDialog from './CreateDialog'
import ReSignDialog from './ReSignDialog'

const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getOrderList,
  doDelOrder
} = require(`@/v2/${PROCESS_NAME}/api/dns/finance`)
const {
  getFreeStatistics,
  getFreeSslDetail
} = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

export default {
  components: {
    // ApplyDialog,
    DetailDialog,
    VerifyPopover,
    CreateDialog,
    ReSignDialog
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      total: 0,
      queryInfo: {
        // 证书状态
        sslStatus: 'all',
        // 证书到期时间
        sslEndTimes: 'all',
        // 排序
        orderBy: '',
        start_date: '',
        end_date: '',
        users: '',
        domain: '',
        goodsType: '22,23',
        // 支付状态 14 = 支付成功, 16 = 已退款
        // status: '14,16'
        status: '14,16',
        cur_page: 1, // 当前的页数
        page_size: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      loading: false,
      btnLoading: false,
      // 证书状态
      CERT_STATUS,

      sumObj: {
        totalCount: {
          name: '全部证书',
          value: 0,
          color: 'text-ants-text-1',
          time: 'all'
        },
        validCount: {
          name: '有效证书',
          value: 0,
          color: 'text-success',
          time: '9999'
        },
        e30Count: {
          name: '30天内过期',
          value: 0,
          color: 'text-warning',
          time: '30'
        },
        e7Count: {
          name: '7天内过期',
          value: 0,
          color: 'text-warning',
          time: '7'
        },
        expiredCount: {
          name: '已过期',
          value: 0,
          color: 'text-error',
          time: '0'
        }
      }
    }
  },
  created() {
    this.getSslDashboard()
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      // 一天的时间戳
      const oneDay = 24 * 60 * 60 * 1000
      // 获取当前时间戳
      const now = new Date().getTime()
      
      try {
        const { sslStatus, sslEndTimes } = this.queryInfo
        const { data: res } = await getOrderList({
          ...this.queryInfo,
          sslStatus: sslStatus === 'all' ? undefined : sslStatus,
          sslEndTimes:
            sslEndTimes === 'all'
              ? undefined
              : sslEndTimes == 0
              ? [0, now]
              : [now, now + sslEndTimes * oneDay]
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        const arr = obj.list || []
        const newArr = arr.map((item) => {
          const orderExtra = JSON.parse(item.orderExtra || '{}')
          return {
            ...item,
            // 购买的证书产品信息
            orderExtra: {
              ...orderExtra,
              domainArr: (orderExtra.domains || '').split(',')
            },
            // 用于查询证书是否购买成功，code = 1 证书购买成功，code = 0 证书购买失败，需要用户手动修改证书信息
            orderExtra2: JSON.parse(item.orderExtra2 || '{}'),
            orderResult: JSON.parse(item.orderResult || '{}'),
            // 证书状态-到期时间
            acmeVo: item.acmeVo || {},
            errorMsg: '',
            loading: false
          }
        })
        this.tableData = newArr
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 获取证书概览数据
    async getSslDashboard() {
      this.loading = true
      try {
        const { data: res } = await getFreeStatistics()
        if (res.code !== 1) return
        console.log(res)
        const obj = res.free || {}
        Object.keys(this.sumObj).forEach(key => {
          this.sumObj[key].value = obj[key] || 0
        })
      } finally {
        this.loading = false
      }
    },

    // 查询
    toQuery() {
      this.queryInfo.cur_page = 1
      this.getTableData()
    },

    // 排序
    sortChange({ column, prop, order }) {
      console.log(prop, order)
      const obj = {
        orderId: 'order_id',
        createtime: 'createtime',
        endDate: 'ssl_end_time'
      }

      const orderKey = {
        descending: 'desc',
        ascending: 'asc'
      }

      this.queryInfo.orderBy = `${obj[prop]},${orderKey[order]}` || ''
      this.toQuery()
    },

    // 查询证书详情，刚购买的证书查询不到详情，需要手动查询
    async getSslCertDetail(row, idx) {
      if (row.loading) return

      row.loading = true
      try {
        const { data: res } = await getFreeSslDetail({
          orderId: row.orderId
        })
        row.loading = false
        this.$set(this.tableData[idx], 'endDate', res.endDate || '-')
        this.$set(this.tableData[idx], 'crt', res.crt)
        this.$set(this.tableData[idx], 'key', res.key)
        const obj = res.data || {}

        if (res.endDate) {
          // 申请成功
          row.acmeVo.status = 2
        } else {
          row.acmeVo.status = obj.status || 0
          if (row.acmeVo.status == 0) {
            row.errorMsg = obj.msg || res.msg || '申请失败！'
          }
          if (row.acmeVo.status == 3 || row.acmeVo.status == 4) {
            row.textRecords = obj.list || []
          }
        }
        row.isCheck = true
      } finally {
        row.loading = false
      }
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    // 查看详情
    toDetail(row) {
      this.$refs.DetailDialogRef.show({
        orderId: row.orderId,
        crt: row.acmeVo.certCrt,
        key: row.acmeVo.certKey
      })
    },

    // 申请证书
    toApply() {
      this.$refs.ApplyDialogRef.show()
    },

    toCreate() {
      this.$refs.CreateDialogRef.show()
    },

    // 证书重签
    async toReSign(row) {
      this.$refs.ReSignDialogRef.show({
        orderId: row.orderId,
        srcType: row.goodsType == 23 ? 1 : 0,
        domains: row.orderExtra.domains
      })
    },

    // 删除
    async toDel(row) {
      if (this.btnLoading) return
      this.btnLoading = true
      try {
        const result = await this.$doDelete({
          tag: '免费证书'
        })
        if (!result) return
        const { data: res } = await doDelOrder({
          ids: row.orderId
        })
        if (res.code !== 1) return
        this.toQuery()
        this.$msg.success('删除成功')
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
