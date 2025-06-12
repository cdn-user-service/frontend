<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索DNS API',
            key: 'mainServerName',
            value: queryInfo.mainServerName
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            :disabled="$root.loading"
            @click="showCreateUpdateDialog()"
            text="添加 DNS API"
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
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>
        <ants-table-column width="70" prop="id" label="ID"> </ants-table-column>

        <ants-table-column prop="appDomain" label="主域名" min-width="140">
          <template #default="{ row }">
            <ants-copy
              class="cursor-color"
              @click="goRecordPage(row)"
              :text="row.appDomain"
            />
          </template>
        </ants-table-column>

        <ants-table-column prop="remark" label="名称" min-width="140">
        </ants-table-column>
        <ants-table-column prop="source" label="DNS 类型" min-width="120">
          <template #default="{ row }">
            <el-tag size="small" type="primary" v-if="row.source === 'antsdns'"
              >自建dns</el-tag
            >
            <el-tag size="small" type="primary" v-else>{{ row.source }}</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column label="密钥" min-width="250">
          <template #default="{ row, $index }">
            <ul class="space-y-1">
              <li>
                <span class="text-ants-text-4">SecretId：</span>
                <span>{{ row.appId }}</span>
              </li>
              <li>
                <span class="text-ants-text-4">SecretKey：</span>
                <span>{{ row.appkeyText || '********' }}</span>
                <span
                  class="el-icon-view ml-sm cursor-color"
                  @click="toggleAppKey(row, $index)"
                ></span>
              </li>
              <li v-if="row.appUrl">
                <span class="text-ants-text-4">API URL：</span>
                <span>{{ row.appUrl }}</span>
              </li>
            </ul>
          </template>
        </ants-table-column>

        <ants-table-column prop="createTime" label="创建时间" min-width="140">
        </ants-table-column>

        <ants-table-column prop="status" label="状态" min-width="80">
          <template #default="{ row }">
            <span class="el-icon-success text-success" v-if="row.status === 1">
              正常</span
            >
            <span v-else class="el-icon-remove text-error">
              <span v-if="isAdmin">异常</span>
            </span>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="210" auto-fixed>
          <template #default="{ row }">
            <ants-button
              type="success"
              size="mini"
              @click="goRecordPage(row)"
              :disabled="btnLoading"
              text="解析"
            />
            <ants-button
              type="primary"
              size="mini"
              @click="showCreateUpdateDialog(row)"
              :disabled="btnLoading"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="singleDelete(row)"
              :disabled="btnLoading"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加DNS对话框 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" />
  </div>
</template>

<script>
import CreateUpdateDialog from './CreateUpdateDialog'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getDnsApiList,
  doDeleteDnsApi
} = require(`@/v2/${PROCESS_NAME}/api/cdn/dns`)

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        userType: '',
        source: '',
        user: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: [],
      isAdmin: PROCESS_NAME === 'cdn_admin'
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取分组数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getDnsApiList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      this.tableData = res.data.list || []
      this.total = res.data.totalCount
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    toggleAppKey(row, idx) {
      const appkeyText = row.appkeyText ? null : row.appKey
      this.$set(this.tableData[idx], 'appkeyText', appkeyText)
    },

    /**
     * @description: 加密显示 appKey
     */

    // encryAppKey(appKey = '') {
    //   const length = appKey.length
    //   let str = ''
    //   for (let i = 0; i < mailArr[0].length - 3; i++) {
    //     string1 += '*'
    //   }
    //   return
    // },

    /**
     * @description: 添加DNS
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 前往解析页面
     * @param {*} row
     */

    goRecordPage(row) {
      this.$router.push({
        path: './dns/record',
        query: { id: row.id, domain: row.appDomain, source: row.source }
      })
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete(row) {
      const result = await this.$doDelete({
        tag: 'DNS API'
      })
      if (!result) return
      this.btnLoading = true
      const { data } = await doDeleteDnsApi({
        ids: row.id
      })
      this.btnLoading = false

      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: 'DNS API'
      })
      if (!result) return

      this.btnLoading = true

      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      const { data: res } = await doDeleteDnsApi({
        ids: idsArr + ''
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(selectLength + this.antsT('个 DNS API 已成功删除'))
      this.selectArr = [] // 释放
    }
  }
}
</script>
