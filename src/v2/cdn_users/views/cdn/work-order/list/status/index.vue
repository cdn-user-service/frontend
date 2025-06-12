<template>
  <div class="animated fadeIn">
    <!-- <el-card class="content-box">
        <el-row :gutter="20">
          <el-col
            :xs="{ span: 12 }"
            :sm="{ span: 12 }"
            :md="{ span: 6 }"
            :lg="{ span: 6 }"
            :xl="{ span: 6 }"
            v-for="item in orderStatistics"
            :key="item.key"
          >
            <ul class="text-center my-lg">
              <li class="mb-df font-bold text-3xl" :class="item.color">
                {{ item.count }}
              </li>
              <li>{{ antsT(item.name) }}</li>
            </ul>
          </el-col>
        </el-row>
      </el-card> -->

    <el-card class="content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索工单编号',
            key: 'key',
            value: queryInfo.key
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
            :loading="$root.loading"
            @click="getTableData"
            text="刷新"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column prop="id" label="工单编号" min-width="120">
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
        <ants-table-column label="状态" width="100">
          <template #default="{ row }">
            {{ antsT(workOrderStatus[+row.status]) }}
            <!-- <span class="text-warning el-icon-remove"> 未结单</span> -->
          </template>
        </ants-table-column>
        <ants-table-column label="操作" width="160">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              :disabled="btnLoading"
              @click="goDetailPage(row)"
              text="详情"
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
  </div>
</template>

<script>
// API
import {
  getWorkOrderList,
  doDeleteWorkerOrder
} from '@/v2/cdn_users/api/cdn/work-order'
import { workOrderStatus } from '@/global/enum'

// 紧急程度
const urgencyObj = {
  1: '普通咨询',
  2: '操作体验问题',
  3: '业务/系统异常影响问题',
  4: '业务完全不可用'
}

const orderStatistics = [
  {
    key: 'count_waitforme',
    name: '待处理',
    count: 5,
    color: 'text-warning'
  },
  {
    key: 'count_doing',
    name: '处理中',
    count: 10,
    color: 'text-primary'
  },
  {
    key: 'count_doed',
    name: '已结单',
    count: 24,
    color: 'text-success'
  },
  {
    key: 'count_not',
    name: '已驳回',
    count: 1,
    color: 'text-error'
  }
]
export default {
  data() {
    return {
      orderStatistics,
      urgencyObj,
      workOrderStatus,

      btnLoading: false,
      total: 0,
      queryInfo: {
        start_date: '', // 开始日期
        end_date: '', // 结束日期

        // 紧急程度
        // urgentLevel: 1,
        status: +this.$route.query.status || 0,
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      tableData: []
    }
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.query.status': function(newVal, oldVal) {
      this.queryInfo.status = +newVal
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

    goDetailPage({ id }) {
      this.$router.push({ path: './detail', query: { id } })
    },

    async singleDelete({ id }) {
      const result = await this.$doDelete({
        tag: '工单'
      })
      if (!result) return

      const { data } = await doDeleteWorkerOrder({
        ids: id
      })
      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
    }
  }
}
</script>
