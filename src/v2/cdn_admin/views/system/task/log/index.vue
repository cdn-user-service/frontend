<template>
  <div class="work_item_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索任务名称',
            key: 'beanName',
            value: queryInfo.beanName
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
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
        <ants-table-column
          type="selection"
          width="45"
          align="center"
        ></ants-table-column>
        <ants-table-column prop="logId" label="日志ID" min-width="100">
        </ants-table-column>
        <ants-table-column prop="jobId" label="任务ID" min-width="100">
        </ants-table-column>
        <ants-table-column prop="beanName" label="描述信息" min-width="140">
        </ants-table-column>
        <ants-table-column prop="params" label="参数" min-width="120">
        </ants-table-column>
        <ants-table-column prop="error" label="error" min-width="120">
          <template slot-scope="scope">
            {{ scope.row.error || '--' }}
          </template>
        </ants-table-column>
        <ants-table-column
          prop="createTime"
          sortable
          label="创建时间"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column label="操作" width="100">
          <template slot-scope="scope">
            <ants-button
              type="danger"
              size="mini"
              @click="deleteWork(scope.row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
// api
import { getLogList } from '@/v2/cdn_admin/api/system/schedule'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        beanName: '', // 定时任务标题
        page: 1, // 当前的页数
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
      const { data: res } = await getLogList({
        ...this.queryInfo,
        page: this.queryInfo.page + '',
        limit: this.queryInfo.limit + ''
      })

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
      const idsArr = this.selectArr.map(e => {
        return e.id
      })

      const { data: res } = await this.$http.post('', idsArr)

      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除 ' + selectLength + ' 个任务日志')
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

      const { data: res } = await this.$http.post('', [row.id])

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除任务日志成功')
    }
  }
}
</script>
