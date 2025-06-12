<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <el-skeleton :rows="10" animated :loading="$attrs.loading || loading">
        <el-result
          v-if="!dnsRewrite.dnsAddress"
          icon="info"
          title="友情提示"
          subTitle="功能暂未开放，请联系管理员！"
        >
          <template slot="extra">
            <ants-button type="primary" size="medium" text="功能未开放" />
          </template>
        </el-result>

        <template v-else>
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
                :disabled="$root.loading || btnLoading"
                @click="toSave('add')"
                text="添加强制跳转"
              />
              <ants-button
                type="primary"
                size="small"
                icon="el-icon-edit"
                :disabled="selectArr && selectArr.length <= 0"
                :loading="btnLoading"
                @click="toSave('allUpdate')"
                text="批量修改跳转地址"
              />
              <ants-button
                type="info"
                size="small"
                icon="el-icon-delete"
                :disabled="$root.loading"
                :loading="btnLoading"
                @click="batchDelete()"
                text="批量删除"
              />
            </template>
          </table-query-form>

          <ants-table
            :data="tableData"
            @getTableData="getTableData"
            @selection-change="handleSelectionChange"
            :total="total"
            :queryInfo="queryInfo"
            v-loading="loading"
          >
            <ants-table-column type="selection" width="45" align="center">
            </ants-table-column>

            <ants-table-column width="60" prop="id" label="ID" />

            <ants-table-column prop="domain" label="域名" min-width="150">
            </ants-table-column>

            <ants-table-column
              prop="rewriteUrl"
              label="跳转地址"
              min-width="200"
            >
            </ants-table-column>

            <ants-table-column prop="certInfo" label="证书状态" min-width="100">
              <template #default="{ row }">
                <div v-if="row.certInfo">
                  <span
                    class="text-success el-icon-success"
                    v-if="row.certInfo.status == 2"
                    >申请成功</span
                  >
                  <span
                    class="text-warning el-icon-remove"
                    v-if="row.certInfo.status == 1"
                    >申请中</span
                  >
                  <span
                    class="text-error el-icon-error"
                    v-if="row.certInfo.status == 0"
                    >申请失败</span
                  >

                  <span class="text-warning" v-if="row.certInfo.status == 3"
                    >需添加TXT记录</span
                  >
                </div>
              </template>
            </ants-table-column>

            <ants-table-column
              prop="cnameDomain"
              label="证书申请设置"
              min-width="150"
            >
              <template #default="{ row }">
                <el-popover placement="left" width="700" trigger="click">
                  <div class="p-sm">
                    <div class="font-semibold">
                      需要为域名
                      <strong class="text-primary px-1">
                        {{ row.domain }}
                      </strong>
                      添加2条CNAME记录：
                    </div>

                    <el-table
                      size="mini"
                      border
                      :data="[
                        {
                          top: (row.rdata || {}).top1,
                          value: (row.rdata || {}).value1
                        },
                        {
                          top: (row.rdata || {}).top2,
                          value: (row.rdata || {}).value2
                        }
                      ]"
                    >
                      <ants-table-column
                        prop="top"
                        label="主机记录"
                        min-width="160"
                      >
                        <template #default="{ row: row1 }">
                          <ants-copy v-if="row1.top" :text="row1.top" />
                        </template>
                      </ants-table-column>
                      <ants-table-column
                        prop="type"
                        label="记录类型"
                        min-width="60"
                      >
                        {{ (row.rdata || {}).type }}
                      </ants-table-column>
                      <ants-table-column
                        prop="line"
                        label="线路"
                        min-width="60"
                      >
                        默认
                      </ants-table-column>
                      <ants-table-column
                        prop="value"
                        label="记录值"
                        min-width="200"
                      >
                        <template #default="{ row: row1 }">
                          <ants-copy :text="row1.value" />
                        </template>
                      </ants-table-column>
                    </el-table>
                  </div>

                  <span slot="reference" class="text-primary cursor-pointer">
                    查看
                    <i class="text-df el-icon-info" />
                  </span>
                </el-popover>
              </template>
            </ants-table-column>

            <ants-table-column
              prop="createTime"
              label="创建时间"
              min-width="150"
            >
            </ants-table-column>

            <ants-table-column
              label="操作"
              width="210"
              v-if="!$root.disabledCrud"
            >
              <template #default="{ row }">
                <ants-button
                  type="success"
                  size="mini"
                  :disabled="btnLoading"
                  @click="toReplay(row)"
                  text="重试"
                />
                <ants-button
                  type="primary"
                  size="mini"
                  :disabled="btnLoading"
                  @click="toSave('update', row)"
                  text="修改"
                />
                <ants-button
                  type="danger"
                  size="mini"
                  :disabled="btnLoading"
                  @click="toDel(row)"
                  text="删除"
                />
              </template>
            </ants-table-column>
          </ants-table>
        </template>
      </el-skeleton>
    </el-card>

    <FormDialog ref="FormDialogRef" @refresh="refresh" />
  </div>
</template>

<script>
import FormDialog from './FormDialog.vue'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { requestOther } = require(`@/v2/${PROCESS_NAME}/api/public`)

export default {
  components: { FormDialog },
  props: {
    admin: Boolean
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      selectArr: [],
      tableData: [],
      total: 0,
      queryInfo: {
        key: '',
        pagenum: 1,
        pagesize: 20
      },

      // 管理端
      adminDnsRewrite: {
        dnsAddress: '',
        cnameDomain: ''
      }
    }
  },
  computed: {
    dnsRewrite({ $root }) {
      if (this.admin) {
        return this.adminDnsRewrite
      }
      return $root.dns_rewrite || {}
    }
  },
  watch: {
    dnsRewrite: {
      handler(newVal = {}, oldVal = {}) {
        if (!this.admin && newVal.dnsAddress) {
          this.getTableData()
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    // 刷新页面
    refresh() {
      this.selectArr = []
      this.getTableData()
    },
    // 管理端
    init(pvalue = {}) {
      this.adminDnsRewrite = {
        ...this.adminDnsRewrite,
        ...pvalue
      }
      console.log('adminDnsRewrite', this.adminDnsRewrite)

      this.getTableData()
    },

    // 获取表格数据
    async getTableData() {
      console.log('getTableData', this.dnsRewrite)
      this.loading = true
      try {
        const { data: res } = await requestOther({
          url: this.dnsRewrite.dnsAddress + '/app/rewrite/cname/list',
          method: 'post',
          param: JSON.stringify({
            ...this.queryInfo
          })
        })
        if (res.code !== 1) return
        const trueData = JSON.parse(res.data || '{}')
        const obj = trueData.data || {}
        console.log(obj)
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.loading = false
      }
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    toSave(type, row = {}) {
      if (!this.dnsRewrite.dnsAddress) {
        this.$msg.error('功能暂未开放')
        return
      }
      if (type === 'allUpdate') {
        this.$refs.FormDialogRef.show(type, this.selectArr, this.dnsRewrite)
      } else {
        this.$refs.FormDialogRef.show(type, row, this.dnsRewrite)
      }
    },

    // 重试
    async toReplay(row = {}) {
      this.btnLoading = true
      try {
        const { data: res } = await requestOther({
          url: this.dnsRewrite.dnsAddress + '/app/rewrite/cname/save',
          method: 'post',
          param: JSON.stringify({
            ...row
          })
        })

        if (res.code !== 1) return
        const trueData = JSON.parse(res.data || '{}')
        if (!trueData.code) return this.$msg.error(trueData.msg)
        this.$msg.success('操作成功')
      } finally {
        this.btnLoading = false
      }
    },

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: 'URL转发'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await requestOther({
          url: this.dnsRewrite.dnsAddress + '/app/rewrite/cname/delete',
          method: 'post',
          param: JSON.stringify({
            ids: this.selectArr.map((item) => item.id) + ''
          })
        })
        if (res.code !== 1) return
        const trueData = JSON.parse(res.data || '{}')
        if (!trueData.code) return this.$msg.error(trueData.msg)
        this.getTableData()
        this.$msg.success(this.antsT('删除成功'))
      } finally {
        this.btnLoading = false
      }
    },

    async toDel(row = {}) {
      const result = await this.$doDelete({
        tag: '强制跳转'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await requestOther({
          url: this.dnsRewrite.dnsAddress + '/app/rewrite/cname/delete',
          method: 'post',
          param: JSON.stringify({
            ids: row.id
          })
        })
        if (res.code !== 1) return
        const trueData = JSON.parse(res.data || '{}')
        if (!trueData.code) return this.$msg.error(trueData.msg)
        this.getTableData()
        this.$msg.success(this.antsT('删除成功'))
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>
