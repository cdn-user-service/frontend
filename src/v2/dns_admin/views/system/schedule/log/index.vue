<template>
  <div class="work_item_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '输入任务名称搜索',
            key: 'beanName',
            value: queryInfo.beanName
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <el-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            @click="batchDelete"
            >{{ antsT('批量删除') }}</el-button
          >
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column
          type="selection"
          width="45"
          align="center"
          key="0"
        ></ants-table-column>

        <ants-table-column prop="logId" label="日志ID" min-width="120"/>
        <ants-table-column prop="jobId" label="任务ID" min-width="120"/>
        <ants-table-column prop="beanName" label="beanName" min-width="120">
        </ants-table-column>
        <ants-table-column prop="params" label="参数" min-width="120">
        </ants-table-column>
        <ants-table-column prop="times" label="次数" min-width="120">
        </ants-table-column>
        <ants-table-column prop="error" label="error" min-width="120">
          <template #default="{ row }">
            {{ row.error || '--' }}
          </template>
        </ants-table-column>
        <ants-table-column
          prop="createTime"
          sortable
          label="创建时间"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="danger" size="mini" @click="deleteWork(row)"
              >删除</el-button
            >
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
// api
import { getLogList, doDeleteLog } from '@/v2/dns_admin/api/system/schedule'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        beanName: '', // 定时任务标题
        page: 1, // 当前的页数
        sidx: 'log_id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      selectArr: [],
      tableData: [],
      btnLoading: false
    }
  },
  created() {
    this.getTableData()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取定时任务日志数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getLogList(this.queryInfo)

      this.$root.loading = false
      if (res.code !== 1) return

      this.tableData = res.page.list || []
      this.total = res.page.totalCount || 0
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '任务日志'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map(e => e.logId)

      const { data: res } = await doDeleteLog({
        ids: idsArr + ''
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async deleteWork(row) {
      const result = await this.$doDelete({
        name: row.title,
        tag: '任务日志'
      })
      if (!result) return

      const { data: res } = await doDeleteLog({
        ids: row.logId
      })

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
    }
  }
}
</script>
