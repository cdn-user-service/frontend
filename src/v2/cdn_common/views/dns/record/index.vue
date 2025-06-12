<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form>
        <template slot="buttons">
          <ants-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            :disabled="$root.loading"
            @click="showCreateUpdateDialog()"
            text="添加记录"
          />
          <ants-button
            size="small"
            :loading="$root.loading"
            :text="`主域名：${domain} 【${source}】`"
          />
        </template>
      </table-query-form>

      <ants-table :data="tableData" :is-pagination="false">
        <ants-table-column min-width="140" label="记录ID" prop="recordId">
        </ants-table-column>
        <ants-table-column prop="top" label="主机记录" min-width="120">
        </ants-table-column>

        <ants-table-column prop="recordType" label="记录类型" min-width="120">
        </ants-table-column>

        <ants-table-column prop="line" label="线路" min-width="120">
        </ants-table-column>

        <ants-table-column prop="value" label="记录值" min-width="140">
        </ants-table-column>

        <ants-table-column prop="ttl" label="TTL" min-width="60">
        </ants-table-column>

        <ants-table-column label="操作" width="160" auto-fixed>
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            />
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

    <!-- 添加DNS对话框 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" :line-list="lineList" />
  </div>
</template>

<script>
import CreateUpdateDialog from './components/CreateUpdateDialog'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getRecordList,
  getlineList,
  doCreateRecord,
  doDeleteRecord
} = require(`@/v2/${PROCESS_NAME}/api/cdn/dns`)

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      apiId: this.$route.query.id,
      domain: this.$route.query.domain,
      btnLoading: false,
      source: '',
      tableData: [],
      lineList: []
    }
  },
  created() {
    this.getRecordLinelist()
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取分组数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getRecordList({
        id: this.apiId
      })
      this.$root.loading = false
      if (res.code !== 1) return
      this.tableData = res.data || []
      this.total = this.tableData.length
      this.source = res.source
    },

    /**
     * @description: 获取线路列表
     * @return {*}
     */

    async getRecordLinelist() {
      const { data: res } = await getlineList({
        id: this.apiId
      })

      if (res.code !== 1) return
      this.lineList = res.data || []
    },

    /**
     * @description: 添加DNS
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete({ recordId }) {
      const result = await this.$doDelete({
        tag: '解析记录'
      })
      if (!result) return
      this.btnLoading = true
      const { data } = await doDeleteRecord({
        // 记录ID
        recordId,
        // DNSAPI id
        id: this.apiId
      })

      this.btnLoading = false

      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除记录成功'))
    }
  }
}
</script>
