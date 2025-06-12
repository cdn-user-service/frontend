<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="
          isAdmin
            ? [
                {
                  name: '输入用户ID检索',
                  key: 'userId',
                  value: queryInfo.userId
                }
              ]
            : []
        "
        :queryInfo="queryInfo"
        @changeInput="getTableData"
        :show-date-picker="true"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            icon="el-icon-download"
            size="small"
            text="导出日志"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            @click="deleteBatch"
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
        <ants-table-column
          prop="jobStartTime"
          sortable
          label="时间"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column prop="jobFunction" label="操作类型" min-width="140">
          <template #default="{ row }">
            {{ getJobFunctionName(row) }}
          </template>
        </ants-table-column>
        <ants-table-column prop="jobContent" label="操作内容" min-width="200">
          <template #default="{ row }">
            {{ getJobContent(row) }}
          </template>
        </ants-table-column>

        <ants-table-column prop="jobProgress" label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag type="primary" size="mini">
              {{ row.jobProgress }}
            </el-tag>
          </template>
        </ants-table-column>

        <ants-table-column label="用户" min-width="140" v-if="isAdmin">
          <template #default="{ row }">
            <div>ID: {{ row.userId }}</div>
            <div>
              {{ (row.userInfo || {}).username }}
            </div>
          </template>
        </ants-table-column>
        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              @click="showDetailDialog(row)"
              text="详情"
            />
            <ants-button
              type="info"
              size="mini"
              @click="deleteSingle(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <DetailDialog ref="DetailDialogRef" />
  </div>
</template>

<script>
import DetailDialog from './DetailDialog.vue'

// api
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getBatchLogList,
  doDeteleBatchLog
} = require(`@/v2/${PROCESS_NAME}/api/dns/bulk`)

export default {
  components: {
    DetailDialog
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dateSearch: '', // 搜索日期

      total: 0,
      queryInfo: {
        userId: null,
        startDate: '',
        endData: '',
        jobFunction: '',
        jobType: 1,
        key: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      btnLoading: false,

      // 操作类型方法名称
      jobFunctionList: [
        {
          fun: 'batchcreatedomain',
          name: '批量添加域名',
          type: 1
        },
        {
          fun: 'BatchRetrieveDomain',
          name: '取回域名',
          type: 2
        },
        {
          fun: 'BatchMultidomainrecordSet',
          name: '添加解析',
          type: 3
        },
        {
          fun: 'BatchImportRecordsSet',
          name: '导入记录',
          type: 4
        },
        {
          fun: '/batch/update/record',
          name: '批量修改记录',
          type: 5
        }
      ]
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取批量操作日志
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getBatchLogList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      this.tableData = obj.list || []
      this.total = obj.totalCount || 0
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description: 返回操作类型名称
     * @param {*} row
     */
    getJobFunctionName(row) {
      const lowerFun = row.jobFunction.toLowerCase()
      let typeName = ''

      this.jobFunctionList.some((item) => {
        const funItem = item.fun.toLowerCase()
        if (lowerFun == funItem) {
          typeName = item.name
          row.type = item.type
          row.typeName = item.name
          return true
        }
      })

      return typeName
    },

    /**
     * @description: 返回操作内容
     * @param {*} row
     */

    getJobContent(row) {
      const content = JSON.parse(row.jobContent || '{}')

      let text = ''
      let arrLength = 0

      const domainsArr = (content.domains || '').split(',')

      // const domainsObj = JSON.parse(content.domains)
      const retrieveDomainsArr = (content.domains || '').split(',')

      const contentArr = (content.form || '').split('=')
      const domainsIdLength = (contentArr[1] || '').split(',').length - 1
      // const recordsArr = JSON.parse((contentArr[2] || []).slice(0, -1) || '[]')

      switch (row.type) {
        // 批量添加域名
        case 1:
          arrLength = domainsArr.length
          text = `添加 ${domainsArr[0]} ${
            arrLength > 1 ? '等' : ''
          } ${arrLength}个域名`
          break
        case 2:
          text = `取回 ${retrieveDomainsArr[0]} ${
            retrieveDomainsArr.length > 1 ? '等' : ''
          } ${retrieveDomainsArr.length}个域名`
          break
        case 3:
          text = `为 ${domainsIdLength} 个域名添加 ${row.jobProgress} 条解析记录`
          break
        case 4:
          arrLength = JSON.parse(content.records).length
          text = `为域名 ${content.domain} 导入 ${arrLength} 条解析记录`
          break
        case 5:
          arrLength = domainsArr.length
          text = `修改 ${domainsArr[0]} ${
            arrLength > 1 ? '等' : ''
          } ${arrLength}个域名`
          break
      }
      row.resultText = text
      return text
    },

    /**
     * @description: 查看日志详情
     * @param {*} row
     */

    showDetailDialog(row) {
      this.$refs.DetailDialogRef.show(row)
    },

    /**
     * @description: 批量删除日志
     */

    async deleteBatch() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '日志'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((e) => {
        return e.id
      })

      const { data: res } = await doDeteleBatchLog({
        ids: idsArr.toString()
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(`已成功删除 ${selectLength} 个日志`)
      this.selectArr = [] // 释放
    },

    /**
     * @description: 删除日志
     * @param {*} row
     */

    async deleteSingle(row) {
      const result = await this.$doDelete({
        tag: '日志'
      })
      if (!result) return

      const { data } = await doDeteleBatchLog({
        ids: row.id
      })

      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success('删除日志成功')
    }
  }
}
</script>
