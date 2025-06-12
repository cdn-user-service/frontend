<template>
  <el-popover
    placement="bottom-start"
    width="300"
    trigger="click"
    ref="taskPopoverRef"
  >
    <div class="px-sm">
      <el-table
        size="mini"
        style="margin: 0"
        :border="false"
        :data="tableData"
        row-key="id"
        @row-click="onRowClick"
        v-loading="loading"
      >
        <el-table-column min-width="200" property="name" label="选择监控任务">
          <template #header>
            <el-input
              class="ants-search_input"
              :placeholder="antsT('检索域名')"
              clearable
              v-model="queryInfo.domain"
              size="small"
              @change="toQuery"
              style="width: 100%"
            >
              <i
                slot="prefix"
                class="el-input__icon aicon icon-sousuo"
                @click="toQuery"
              />
            </el-input>
          </template>
          <template #default="{ row }">
            <el-radio v-model="currentTask.id" :label="row.id">
              {{ `${row.top}.${row.domain}` }}
            </el-radio>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        style="margin-top: 10px"
        layout="total, prev, pager, next"
        :total="total"
        small
        :page-sizes="[10, 20, 50, 100, 200]"
        :page-size="queryInfo.limit"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
      />
    </div>

    <span
      slot="reference"
      class="mr-lg cursor-color inline-block py-xs px-df rounded-xl bg-ants-bg-3"
    >
      <span
        class="truncate inline-block align-middle mr-xs"
        style="min-width: 150px; max-width: 250px"
      >
        {{ currentTask.name }}
      </span>
      <i class="el-icon-caret-bottom"></i>
    </span>
  </el-popover>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getRuleList } = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

export default {
  data() {
    return {
      currentTask: {
        id: null,
        name: ''
      },

      tableData: [],
      total: 0,
      queryInfo: {
        domain: '',
        status: null,
        userId: 0,
        username: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize
      },
      loading: false
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    setDefaultData({ taskId, name }) {
      console.log(taskId)
      this.currentTask.id = taskId
      this.currentTask.name = name
    },

    // 获取所有任务数据
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getRuleList(this.queryInfo)
        this.loading = false
        if (res.code !== 1) return
        const { list = [], totalCount = 0 } = res.data || {}
        this.tableData = list
        this.total = totalCount
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    // 检索
    toQuery() {
      this.queryInfo.key = this.queryInfo.key.trim()
      this.queryInfo.pagenum = 1
      this.getTableData()
    },

    // 监听limit 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.limit = newSize
      this.getTableData()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.getTableData()
    },

    // 点击选择任务
    onRowClick(row) {
      this.currentTask.id = row.id
      this.currentTask.name = `${row.top}.${row.domain}`
      // 关闭popover
      this.$refs.taskPopoverRef.doClose()
      // 重新查询数据
      this.$emit('change', row)
    }
  }
}
</script>
