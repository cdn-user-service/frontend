<template>
  <el-popover
    placement="bottom-start"
    width="260"
    trigger="click"
    ref="domainPopoverRef"
  >
    <span
      slot="reference"
      class="inline-block cursor-color text-center py-xs pl-df pr-lg border border-ants-border-2 rounded-xl"
      style="min-width:260px;max-width:400px;"
    >
      {{ currentRow.domain || '请选择要查询解析的域名' }}
      <i
        style="margin-right:-10px;margin-top:2px;"
        class="el-icon-plus float-right"
      ></i>
    </span>

    <div class="">
      <el-table
        style="margin-top:0;"
        size="mini"
        :data="tableData"
        height="340px"
        @row-click="onRowClick"
        border
        row-key="id"
        v-loading="loading"
        class="domain-popover-table"
      >
        <div slot="empty">
          <el-empty :description="antsT('还没有任何主域名')">
            <ants-button
              type="primary"
              size="mini"
              @click="$router.push('/dns/httpdns/domain')"
              text="前往添加主域名"
            />
          </el-empty>
        </div>
        <ants-table-column
          prop="domain"
          label="域名"
          min-width="200"
        >
          <template #header>
            <el-input
              class="ants-search_input"
              :placeholder="antsT('检索域名')"
              clearable
              v-model="query.domain"
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
              v-model="currentRow.id"
              :label="row.id"
            >
              {{ row.domain }}
            </el-radio>
          </template>
        </ants-table-column>
      </el-table>
      <el-pagination
        style="margin-top:5px;"
        background
        layout="total, prev, pager, next"
        :total="total"
        small
        :page-sizes="[10, 20, 50, 100, 200]"
        :page-size="query.limit"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="query.page"
      />
    </div>
  </el-popover>
</template>

<script>
// api
const PROCESS_NAME = process.env.VUE_APP_NAME

export default {
  data() {
    return {
      loading: false,
      total: 0,
      query: {
        domian: '',
        page: 1,
        limit: 10
      },
      tableData: [],
      currentRow: {}
    }
  },
  computed: {
    //
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    toQuery() {
      this.query.page = 1
      this.getTableData()
    },

    // 获取表格数据
    async getTableData() {
      const mokeData = []
      for (let i = 0; i < 10; i++) {
        mokeData.push({
          id: i + 1,
          domain: `testdomain_${i}.com`
        })
      }
      this.tableData = mokeData
      this.total = mokeData.length

      //   this.loading = true
      //   const { data: res } = await getList(this.query)
      //   this.loading = false
      //   if (res.code !== 1) return
      //   const obj = res.data || {}

      //   this.tableData = obj.list || []
      //   this.total = obj.totalCount || 0
    },

    // 点击
    onRowClick(row) {
      this.currentRow = row
      // 隐藏popover
      this.$refs.domainPopoverRef.doClose()
      this.$emit('change', row)
    },

    // 监听limit 改变事件
    handleSizeChange(newSize) {
      this.query.limit = newSize
      this.getTableData()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.query.page = newPage
      this.getTableData()
    }
  }
}
</script>

<style lang="scss">
.domain-popover-table {
  .el-table__cell {
    padding: 3px 0;
  }
}
</style>
