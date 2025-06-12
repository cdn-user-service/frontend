<template>
  <div>
    <el-card class="animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索用户',
            key: 'user',
            value: queryInfo.user
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
        show-date-picker
        :startDateKey="'start_date'"
        :endDataKey="'end_date'"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            size="small"
            icon="el-icon-refresh"
            :disabled="$root.loading"
            text="刷新"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :disabled="$root.loading"
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
        <ants-table-column width="120" prop="id" label="工单编号">
        </ants-table-column>

        <ants-table-column label="相关产品与服务" min-width="140">
          <template #default="{ row }">
            {{ row.categoryObj && row.categoryObj.title }}
          </template>
        </ants-table-column>
        <ants-table-column prop="title" label="标题" min-width="140">
        </ants-table-column>
        <ants-table-column label="紧急程度" min-width="140">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.urgentLevel > 2 ? 'danger' : 'primary'"
            >
              {{ urgencyObj[+row.urgentLevel] }}
            </el-tag>
          </template>
        </ants-table-column>
        <ants-table-column
          prop="createdate"
          sortable
          label="提交时间"
          min-width="140"
        >
        </ants-table-column>
        <ants-table-column label="状态" min-width="100">
          <template #default="{ row }">
            {{ workOrderStatus[+row.status] }}
            <!-- <span class="text-warning el-icon-remove"> 未结单</span> -->
          </template>
        </ants-table-column>

        <ants-table-column prop="userName" label="用户" min-width="140">
        </ants-table-column>

        <ants-table-column label="操作" width="160">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              @click="goDetailPage(row)"
              text="详情"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
// API
import {
  getWorkOrderList,
  doBatchDeleteWorkOrder
} from '@/v2/cdn_admin/api/cdn/work-order'

import { workOrderStatus } from '@/global/enum'

// 紧急程度
const urgencyObj = {
  1: '普通咨询',
  2: '操作体验问题',
  3: '业务/系统异常影响问题',
  4: '业务完全不可用'
}

export default {
  data() {
    return {
      urgencyObj,
      total: 0,
      queryInfo: {
        start_date: '', // 开始日期
        end_date: '', // 结束日期

        // 紧急程度
        // urgentLevel: 0,
        status: +this.$route.query.status || 0,
        // 检索用户，TODO：暂时没有
        user: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      // 工单状态
      workOrderStatus,
      selectArr: [],
      tableData: []
    }
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.query.status': function(newVal, oldVal) {
      this.queryInfo.status = +newVal || 0
      this.queryInfo.page = 1
      this.tableData = []
      this.total = 0
      this.getTableData()
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getWorkOrderList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return

      this.tableData = (res.data || {}).list || []
      this.total = (res.data || {}).totalCount || 0
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 添加修改对话框显示
    goDetailPage({ id }) {
      this.$router.push({ path: './detail', query: { id } })
    },

    /**
     * @description: 删除单个
     */

    async singleDelete({ id }) {
      const result = await this.$doDelete({
        tag: '工单'
      })
      if (!result) return

      const { data: res } = await doBatchDeleteWorkOrder({
        ids: id
      })
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
    },

    /**
     * @description: 批量删除工单
     */

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '工单'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      const { data: res } = await doBatchDeleteWorkOrder({
        ids: idsArr + ''
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
      this.selectArr = [] // 释放
    }
  }
}
</script>
