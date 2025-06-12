<template>
  <div>
    <el-card class="">
      <el-row :gutter="20" slot="header">
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
      </el-row>

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
            :loading="$root.loading || loading"
            @click="toQuery()"
          />
          <ants-button
            v-if="!isAdmin"
            type="primary"
            size="small"
            icon="el-icon-plus"
            text="购买SSL证书"
            :disabled="$root.loading"
            :loading="loading"
            @click="goBuyPlan()"
          />
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-download"
            text="下载验证文件"
            :disabled="$root.loading"
            :loading="loading"
            @click="toDownloadDCV()"
          />
          <!-- <ants-button
            type="info"
            size="small"
            icon="el-icon-finished"
            :disabled="$root.loading"
            :loading="loading"
            text="批量购买"
          /> -->
          <!-- 
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-upload2"
            text="上传文件"
            :disabled="$root.loading"
            :loading="loading"
          /> -->
        </template>
        <template slot="inputs">
          <ants-select
            v-model="queryInfo.status"
            size="small"
            placeholder="请选择"
            style="width: 100px;margin-right: 10px;"
            @change="toQuery"
          >
            <ants-option label="全部" value="14,16" />
            <ants-option label="未取消" value="14" />
            <ants-option label="已取消" value="16" />
          </ants-select>
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
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

        <ants-table-column prop="name" label="产品名称" min-width="140">
          <template #default="{ row }">
            {{ row.orderExtra.productName }}
          </template>
        </ants-table-column>

        <ants-table-column
          prop="domainArrays"
          label="主域名"
          min-width="140"
          show-overflow-tooltip
        >
        </ants-table-column>

        <ants-table-column prop="certId" label="CA订单号" min-width="140">
        </ants-table-column>

        <ants-table-column prop="createtime" label="购买日期" min-width="140">
        </ants-table-column>

        <ants-table-column prop="endDate" label="有效期" min-width="80">
          <template #default="{ row }">
            <span v-if="row.orderExtra.years">
              {{ row.orderExtra.years }} {{ antsT('年') }}
            </span>
          </template>
        </ants-table-column>

        <ants-table-column prop="buyPayable" label="金额" min-width="80">
          <template #default="{ row }">
            {{ row.buyPayable | priceFormat }}
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="状态" min-width="80">
          <template #default="{ row }">
            <div v-if="!row.orderExtra2" class="text-warning">
              申请中
            </div>

            <div v-else>
              <el-tooltip
                v-if="row.orderExtra2.code != 1"
                class="item"
                effect="dark"
                :content="row.orderExtra2.msg"
                placement="left"
              >
                <span class="text-error">
                  错误
                  <i class="el-icon-info"></i>
                </span>
              </el-tooltip>

              <span v-else :class="statusClass[row.certStatus]">
                {{ CERT_STATUS[row.certStatus] }}
              </span>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column prop="user" label="用户" width="180" v-if="isAdmin">
          <template #default="{ row }">
            <div>ID：{{ row.userId }}</div>
            <ants-copy :text="(row.userinfo || {}).username" />
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="200" align="left" key="opt">
          <template #default="{ row }">
            <div class="text-df flex items-center" :key="row.orderId">
              <template
                v-if="
                  row.certId &&
                    ['COMPLETE', 'REISSUED', 'RENEWED', 'PENDING'].includes(
                      row.certStatus
                    )
                "
              >
                <span class="text-primary cursor-pointer" @click="toDetail(row)"
                  >详情</span
                >
                <el-divider direction="vertical" />
                <span class="text-primary cursor-pointer" @click="toCancel(row)"
                  >取消</span
                >
              </template>

              <template v-else>
                <span class="text-ants-text-5 cursor-not-allowed">
                  详情
                </span>
                <el-divider direction="vertical" />
                <span class="text-ants-text-5 cursor-not-allowed">
                  取消
                </span>
              </template>

              <el-divider direction="vertical" />

              <template
                v-if="
                  ['COMPLETE', 'REISSUED', 'RENEWED'].includes(row.certStatus)
                "
              >
                <DownloadSslCert :certId="row.certId">
                  <span class="text-primary cursor-pointer">下载</span>
                </DownloadSslCert>
                <el-divider direction="vertical" v-if="!isAdmin" />
                <span
                  v-if="!isAdmin"
                  class="text-primary cursor-pointer"
                  @click="toRenew(row)"
                  >续费</span
                >
              </template>

              <template v-else>
                <span class="text-ants-text-5 cursor-not-allowed">下载</span>
                <el-divider v-if="!isAdmin" direction="vertical" />
                <span
                  v-if="!isAdmin"
                  class="text-ants-text-5 cursor-not-allowed"
                  >续费</span
                >
              </template>
            </div>

            <!-- <ants-button
              :key="row.certId"
              v-if="
                ['COMPLETE', 'REISSUED', 'RENEWED', 'PENDING'].includes(
                  row.certStatus
                )
              "
              type="primary"
              size="mini"
              text="详情"
              @click="toDetail(row)"
            />
            <ants-button v-else type="info" disabled size="mini" text="详情" /> -->

            <!-- <template
              v-if="
                ['COMPLETE', 'REISSUED', 'RENEWED'].includes(row.certStatus)
              "
            >
              <ants-button
                v-if="!isAdmin"
                type="success"
                size="mini"
                text="续费"
                @click="toRenew(row)"
              />

              <DownloadSslCert :certId="row.certId">
                <ants-button
                  type="info"
                  size="mini"
                  text="下载"
                  class="ml-sm"
                />
              </DownloadSslCert>
            </template>

            <template v-else>
              <ants-button
                type="info"
                disabled
                size="mini"
                text="续费"
                v-if="!isAdmin"
              />
              <ants-button type="info" disabled size="mini" text="下载" />
            </template> -->
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 证书续费 -->
    <RenewDialog ref="RenewDialogRef" v-if="!isAdmin" />

    <!-- 取消订单 -->
    <ApplyCancelDialog ref="ApplyCancelDialogRef" @refresh="getTableData" />
  </div>
</template>

<script>
import DownloadSslCert from '../apply/DownloadSslCert.vue'
import RenewDialog from './RenewDialog.vue'
import ApplyCancelDialog from '../apply/ApplyCancelDialog.vue'
import { CERT_STATUS } from '../cert-params'
import { exportTxt } from '@/utils/export'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getOrderList } = require(`@/v2/${PROCESS_NAME}/api/dns/finance`)
const {
  getSslDashboard,
  getSslCertDetail,
  doDownloadDcv
} = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const statusClass = {
  COMPLETE: 'text-success',
  RENEWED: 'text-success',
  PENDING: 'text-warning',
  FAILED: 'text-error'
}

export default {
  components: {
    DownloadSslCert,
    RenewDialog,
    ApplyCancelDialog
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      statusClass,
      sumObj: {
        certSum: {
          name: '证书总数',
          value: 0,
          color: 'text-ants-text-1'
        },
        issuedSum: {
          name: '已签发',
          value: 0,
          color: 'text-success'
        },
        applyingSum: {
          name: '申请中',
          value: 0,
          color: 'text-info'
        },
        expiringSoonSum: {
          name: '即将过期',
          value: 0,
          color: 'text-warning'
        },
        expiringSum: {
          name: '已过期',
          value: 0,
          color: 'text-error'
        }
      },
      total: 0,
      queryInfo: {
        start_date: '',
        end_date: '',
        users: '',
        domain: '',
        goodsType: '20,21',
        // 支付状态 14 = 支付成功, 16 = 已退款
        // status: '14,16',
        status: '14,16',
        cur_page: 1, // 当前的页数
        page_size: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      loading: false,
      // 证书状态
      CERT_STATUS
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
      try {
        const { data: res } = await getOrderList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        // this.tableData = obj.list || []
        const arr = obj.list || []

        const newArr = arr.map(item => {
          // 证书信息
          const sslInfo = item.sslInfo || {}
          return {
            ...item,
            sslInfo,
            // 购买的证书产品信息
            orderExtra: JSON.parse(item.orderExtra || '{}'),
            // 用于查询证书是否购买成功，code = 1 证书购买成功，code = 0 证书购买失败，需要用户手动修改证书信息
            orderExtra2: JSON.parse(item.orderExtra2),
            certId: sslInfo.certId,
            certStatus: sslInfo.certStatus,
            domainArrays: sslInfo.domainArrays,
            // 购买日期
            createtime: (item.payRecord || {}).createtime
          }
        })
        this.tableData = newArr
        console.log(this.tableData)
        this.total = obj.totalCount || 0

        this.tableData.forEach(item => {
          if (!item.certId) return
          if (!item.certStatus || item.certStatus == 'PENDING') {
            this.getSslCertDetail(item)
          }
        })
      } finally {
        this.$root.loading = false
      }
    },

    // 查询
    toQuery() {
      this.queryInfo.cur_page = 1
      this.getTableData()
    },

    // 查询证书详情，刚购买的证书查询不到详情，需要手动查询
    async getSslCertDetail(row) {
      row.loading = true
      try {
        const { data: res } = await getSslCertDetail({
          certId: row.certId
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        console.log(obj)
        row.domainArrays = obj.domainArrays || ''
        row.certStatus = obj.certStatus || ''
      } finally {
        row.loading = false
      }
    },

    // 获取证书概览数据
    async getSslDashboard() {
      this.loading = true
      try {
        const { data: res } = await getSslDashboard()
        if (res.code !== 1) return
        console.log(res)
        const obj = res.data || {}
        Object.keys(this.sumObj).forEach(key => {
          this.sumObj[key].value = obj[key] || 0
        })
      } finally {
        this.loading = false
      }
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    // 查看详情
    toDetail({ certId }) {
      if (!certId) return
      this.$router.push({
        name: 'sslOrderApply',
        query: {
          certId
        }
      })
    },

    // 取消订单
    toCancel(row = {}) {
      if (!row.certId) {
        return this.$msg.error('证书ID为空')
      }
      this.$refs.ApplyCancelDialogRef.show(row.certId)
    },

    // 证书续费
    toRenew(row = {}) {
      this.$refs.RenewDialogRef.show(row)
    },

    // 下载验证文件
    async toDownloadDCV() {
      this.loading = true
      try {
        const { data: res } = await doDownloadDcv()
        if (res.code !== 1) return
        const arr = res.data || []
        let txtContent = ''
        arr.forEach((obj = {}) => {
          Object.keys(obj).forEach(key => {
            txtContent += `${key}: ${obj[key]} \r\n`
          })
          txtContent += '\r\n'
        })
        exportTxt(txtContent, 'dcv', false)
      } finally {
        this.loading = false
      }
    },

    // 点击购买证书
    goBuyPlan() {
      const sslPlanUrl = (window.config || {}).sslPlanUrl
      if (sslPlanUrl) {
        window.open(sslPlanUrl)
      } else {
        this.$router.push('/dns/ssl/goods')
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
