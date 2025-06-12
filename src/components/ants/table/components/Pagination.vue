<template>
  <el-pagination
    class="ants-pagination"
    background
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
    small
    :page-sizes="pageSizes"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :page-size="$attrs.queryInfo[$attrs.pagesizeKey] || ($attrs.queryInfo || {}).limit || ($attrs.queryInfo || {}).pagesize"
    :current-page="$attrs.queryInfo[$attrs.pagenumKey] || ($attrs.queryInfo || {}).page || ($attrs.queryInfo || {}).pagenum"
  />
  <!-- :page-size="$attrs.queryInfo[$attrs.pagesizeKey || 'limit']" -->
  <!-- :current-page="$attrs.queryInfo[$attrs.pagenumKey || 'page']" -->
</template>

<script>
export default {
  name: 'AntsPagination',
  props: {
    // 总数
    total: {
      type: Number,
      default: 0
    },
    // 分页
    pageSizes: {
      type: Array,
      default: () => [10, 20, 30, 40, 50, 100, 200]
    }
  },
  data() {
    return {}
  },
  mounted() {
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    tableData() {
      this.$listeners.getTableData()
    },

    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      this.$attrs.queryInfo[this.$attrs.pagesizeKey || 'limit'] = newSize
      console.log(this.$attrs.queryInfo)
      this.$attrs.queryInfo.limit = this.$attrs.queryInfo.pagesize = newSize
      this.tableData()
    },

    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.$attrs.queryInfo[this.$attrs.pagenumKey || 'page'] = newPage
      this.$attrs.queryInfo.page = this.$attrs.queryInfo.pagenum = newPage
      this.tableData()
    }
  }
}
</script>
