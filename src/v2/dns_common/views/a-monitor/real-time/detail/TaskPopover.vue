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
        style="margin:0;"
        :border="false"
        :data="tableData"
        row-key="id"
        @row-click="onRowClick"
        v-loading="loading"
      >
        <el-table-column
          min-width="200"
          property="name"
          label="选择监控任务"
        >
          <template #header>
            <el-input
              class="ants-search_input"
              :placeholder="antsT('检索任务名称')"
              clearable
              v-model="queryInfo.key"
              size="small"
              @change="toQuery"
              style="width:100%;"
            >
              <i
                slot="prefix"
                class="el-input__icon aicon icon-sousuo"
                @click="toQuery"
              />
            </el-input>
          </template>
          <template #default="{ row }">
            <el-radio
              v-model="currentTask.id"
              :label="row.id"
            >
              {{ row.name }}
            </el-radio>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        style="margin-top:10px;"
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
        style="max-width:200px;"
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
const { getTaskList } = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

export default {
  data() {
    return {
      currentTask: {
        id: null,
        name: 'TEST_TSAK_1'
      },

      tableData: [],
      total: 0,
      queryInfo: {
        page: 1,
        limit: 10,
        key: ''
      },
      loading: false
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取所有任务数据
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getTaskList(this.queryInfo)
        this.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
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
      this.currentTask = row
      // 关闭popover
      this.$refs.taskPopoverRef.doClose()
      // 重新查询数据
      this.$emit('change', row)
    }
  }
}
</script>
