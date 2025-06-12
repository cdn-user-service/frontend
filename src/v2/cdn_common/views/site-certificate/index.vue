<template>
  <div>
    <el-card class="animated fadeIn content-box">
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
        v-model="queryInfo.notAfters"
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
            (<span :class="item.color"> {{ item.value }} </span>)
          </span>
        </el-tab-pane>
      </el-tabs>

      <table-query-form
        :search-arr="[
          {
            name: '检索域名',
            key: 'key',
            value: queryInfo.key
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons" v-if="!$root.disabledCrud">
          <ants-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            :disabled="$root.loading"
            @click="showCreateUpdateDialog()"
            text="添加证书"
          />

          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="batchDelete"
            text="批量删除"
          />

          <ants-button
            type="success"
            size="small"
            icon="el-icon-refresh-right"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="batchReSign"
            text="批量重签"
          />
        </template>

        <template slot="inputs">
          <!-- <ants-select
            v-model="queryInfo.notAfters"
            size="small"
            placeholder="请选择"
            style="width: 120px"
            class="mr-sm"
            :loading="$root.loading"
            @change="toQuery()"
          >
            <ants-option
              v-for="item in [
                {
                  key: 'all',
                  title: '全部证书'
                },
                {
                  key: 9999,
                  title: '有效证书'
                },
                {
                  key: 30,
                  title: '30天内过期'
                },
                {
                  key: 7,
                  title: '7天内过期'
                },
                {
                  key: 0,
                  title: '已过期'
                }
              ]"
              :key="item.key"
              :label="item.title"
              :value="item.key"
            />
          </ants-select> -->

          <ants-select
            v-model="queryInfo.status"
            size="small"
            placeholder="请选择"
            style="width: 120px"
            class="mr-sm"
            :loading="$root.loading"
            @change="toQuery()"
          >
            <ants-option label="全部状态" value="all" />
            <ants-option
              v-for="(item, key) in certStatus"
              :key="key"
              :label="item.name"
              :value="key"
            />
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
      >
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>

        <ants-table-column width="60" prop="id" label="ID" sortable="custom">
        </ants-table-column>

        <ants-table-column prop="commonName" label="域名" min-width="180">
          <template #default="{ row }">
            <el-tooltip placement="right-start">
              <div class="inline-block">
                <span>
                  {{ row.commonName }}
                </span>

                <span
                  class="text-primary font-semibold"
                  v-if="row.subjectAlternativeNames.length > 1"
                >
                  +{{ row.subjectAlternativeNames.length - 1 }}
                </span>

                <ants-copy
                  icon
                  :text="row.subjectAlternativeNames.join('\n')"
                />
              </div>

              <div slot="content" style="min-width: 140px">
                <div class="font-semibold pb-xs">
                  {{ antsT('域名') }}【{{
                    row.subjectAlternativeNames.length
                  }}】
                </div>
                <el-scrollbar>
                  <ul class="space-y-2" style="max-height: calc(100vh - 400px)">
                    <li v-for="item in row.subjectAlternativeNames" :key="item">
                      {{ item }}
                    </li>
                  </ul>
                </el-scrollbar>
              </div>
            </el-tooltip>
          </template>
        </ants-table-column>

        <ants-table-column prop="remark" label="证书备注" min-width="140">
        </ants-table-column>

        <ants-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <span
              class="el-icon-success"
              style="color: #036a27"
              v-if="row.status == 6"
            >
              多余证书</span
            >
            <el-tooltip placement="left-start" effect="dark" v-else>
              <span
                class="cursor-pointer"
                :class="(certStatus[row.status] || {}).class"
              >
                {{ antsT((certStatus[row.status] || {}).name) }}
              </span>

              <div
                slot="content"
                class="overflow-y-auto"
                style="max-height: 80vh"
              >
                <pre>
                  {{ row.acmeLog.data || row.acmeLog.msg }}
                 </pre
                >
              </div>
            </el-tooltip>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="notAfter"
          label="到期时间"
          min-width="150"
          sortable="custom"
        >
          <template #default="{ row }">
            <!-- 多余证书的到期时间 -->
            <div
              v-if="row.status == 6"
              :class="{ 'text-warning': row.notAfter < Date.now() }"
            >
              {{ row.notAfter | dateFormat }}
            </div>

            <div v-else-if="(row.cert || {}).notAfter">
              <!-- {{ row.cert.notBefore | dateFormat }} ~ -->
              <span :class="{ 'text-warning': row.cert.notAfter < Date.now() }">
                {{ row.cert.notAfter | dateFormat }}
              </span>
            </div>
            <div v-else>-</div>
          </template>
        </ants-table-column>

        <ants-table-column prop="cert" label="证书内容" min-width="100">
          <template #default="{ row }">
            <div v-if="row.cert">
              <span class="cursor-color text-primary" @click="toDetail(row)">
                <i class="el-icon-tickets"></i>
                {{ antsT('详情') }}</span
              >
            </div>
            <span v-else>-</span>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="user"
          label="用户"
          min-width="180"
          v-if="isAdmin"
        >
          <template #default="{ row }">
            <div>ID：{{ row.userId }}</div>
            <ants-copy :text="(row.user || {}).username" />
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="150" v-if="!$root.disabledCrud">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              :loading="row.loading"
              @click="toReSign(row)"
              text="重签"
            />
            <!-- <ants-button
              type="primary"
              size="mini"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            /> -->
            <ants-button
              type="danger"
              size="mini"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加修改证书 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" @refresh="refresh" />

    <!-- 显示证书内容对话框 -->
    <CertDataDialog ref="CertDataDialogRef" />

    <!-- 证书重签对话框 -->
    <ReSignDialog ref="ReSignDialogRef" @refresh="refresh" />
  </div>
</template>

<script>
import CreateUpdateDialog from './components/CreateUpdateDialog'
import CertDataDialog from './components/CertDataDialog'
import ReSignDialog from './components/ReSignDialog'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getCertifyStatistics,
  getCertifyList,
  doDeleteCertify
} = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

// 证书状态
const certStatus = {
  '-1': {
    name: '待申请',
    class: 'el-icon-remove-outline text-info'
  },
  0: {
    name: '申请中',
    class: 'el-icon-remove text-warning'
  },
  1: {
    name: '申请成功',
    class: 'el-icon-success text-success'
  },
  2: {
    name: '申请失败',
    class: 'el-icon-error text-error'
  },
  3: {
    name: '自有证书',
    class: 'el-icon-s-check text-success'
  },
  4: {
    name: '证书过期',
    class: 'el-icon-remove text-warning'
  },
  5: {
    name: '等待验证',
    class: 'el-icon-remove text-warning'
  }
}
export default {
  components: {
    CreateUpdateDialog,
    CertDataDialog,
    ReSignDialog
  },
  data() {
    return {
      // 是否为管理平台
      isAdmin: PROCESS_NAME === 'cdn_admin',

      btnLoading: false,
      total: 0,
      queryInfo: {
        status: 'all',
        // 排序
        orderBy: '',
        // 查询到期时间
        // notAfters: [1711333625000, 4078088825000],
        notAfters: 'all',
        key: '',
        user: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: [],
      certStatus,

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
          time: '1'
        }
      }
    }
  },
  computed: {
    // 是否可以重签
    statusBtn() {
      return (status = 0) => {
        let obj = {
          type: 'success',
          disabled: false
        }

        if ([1, 3].includes(status)) {
          obj = {
            type: 'info',
            disabled: true
          }
        }
        return obj
      }
    }
  },
  created() {
    this.getSslDashboard()
    this.getTableData()
  },
  methods: {
    refresh() {
      this.getSslDashboard()
      this.getTableData()
    },
    async getTableData() {
      this.$root.loading = true
      // 一天的时间戳
      const oneDay = 24 * 60 * 60 * 1000
      // 获取当前时间戳
      const now = new Date().getTime()
      try {
        const { status, notAfters } = this.queryInfo
        const { data: res } = await getCertifyList({
          ...this.queryInfo,
          status: status === 'all' ? undefined : +status,
          notAfters:
            notAfters === 'all'
              ? undefined
              : notAfters == 1
              ? [1, now]
              : [now, now + notAfters * oneDay]
        })
        if (res.code !== 1) return

        const { list = [], totalCount = 0 } = res.data || {}
        this.tableData = list.map((item) => {
          let subjectAlternativeNames = [item.commonName]
          if ((item.cert || {}).subjectAlternativeNames) {
            subjectAlternativeNames =
              item.cert.subjectAlternativeNames.split(',')
          }
          return {
            ...item,
            acmeLog: JSON.parse(item.acmeLog || '{}'),
            // 证书域名多个
            subjectAlternativeNames
          }
        })
        this.total = totalCount
      } finally {
        this.$root.loading = false
      }
    },

    // 获取证书概览数据
    async getSslDashboard() {
      this.loading = true
      try {
        const { data: res } = await getCertifyStatistics()
        if (res.code !== 1) return
        const obj = res.free || {}
        Object.keys(this.sumObj).forEach((key) => {
          this.sumObj[key].value = obj[key] || 0
        })
      } finally {
        this.loading = false
      }
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 排序
    sortChange({ column, prop, order }) {
      console.log(prop, order)
      const obj = {
        id: 'id',
        notAfter: 'not_after'
      }

      const orderKey = {
        descending: 'desc',
        ascending: 'asc'
      }

      this.queryInfo.orderBy = `${obj[prop]},${orderKey[order]}` || ''
      this.toQuery()
    },

    // 返回证书内容
    getCertData(objInfo = '') {
      let obj = {}
      if (objInfo !== '') {
        obj = JSON.parse(objInfo)
      }
      return obj
    },

    toDetail(row = {}) {
      this.$refs.CertDataDialogRef.showDialog(row)
    },

    showCertData(objInfo = '', key = '', name = '') {
      let obj = {}
      if (objInfo !== '') {
        obj = JSON.parse(objInfo)
      }
      console.log(obj)
      this.$refs.CertDataDialogRef.showDialog(obj[key], name)
    },

    // 勾选
    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 添加修改证书对话框展示
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    // 重新签发证书
    toReSign(row, idx) {
      this.$refs.ReSignDialogRef.show(row)
    },

    // 单个删除
    async singleDelete(row) {
      const result = await this.$doDelete({
        tag: '证书'
      })
      if (!result) return
      this.btnLoading = true
      try {
        const { data } = await doDeleteCertify({
          ids: row.id
        })

        if (data.code !== 1) return
        this.getSslDashboard()
        this.getTableData()
        this.$msg.success(this.antsT('删除证书成功'))
      } finally {
        this.btnLoading = false
      }
    },

    // 批量删除
    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '证书'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const idsArr = this.selectArr.map((item, index) => {
          return item.id
        })
        const { data: res } = await doDeleteCertify({
          ids: idsArr + ''
        })

        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(selectLength + this.antsT('个证书已成功删除'))
        this.selectArr = [] // 释放
      } finally {
        this.btnLoading = false
      }
    },

    async batchReSign() {
      const selectLength = this.selectArr.length
      if (!selectLength) {
        this.$msg.info('请选择需要重签的证书')
        return
      }

      this.$refs.ReSignDialogRef.show({
        ids: this.selectArr.map((e) => e.id) + ''
      })
    }
  }
}
</script>
