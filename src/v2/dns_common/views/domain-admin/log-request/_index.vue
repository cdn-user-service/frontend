<template>
  <div class="dns_log_box">
    <!-- <div class="card_main flex justify-end">
        <el-button type="success" size="small">导出日志</el-button>
      </div> -->
    <el-card class="content-box animated fadeIn">
      <el-table
        :data="goodsList"
        @selection-change="handleSelectionChange"
        v-loading="$root.loading"
        style="margin-top:0;"
      >
        <div slot="empty">
          <el-empty description="暂无数据"> </el-empty>
        </div>
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>
        <ants-table-column prop="createtime" sortable label="时间" width="150">
          <template #default="{ row }">
            {{ row.time | dateFormat }}
          </template>
        </ants-table-column>
        <ants-table-column prop="info" label="日志信息" min-width="400">
        </ants-table-column>
        <ants-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="info" size="mini" @click="deleteLog(row)"
              >删除</el-button
            >
          </template>
        </ants-table-column>
      </el-table>
      <!-- 分页 -->
      <!-- <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          small
          :page-sizes="$root.pageData.pageSizes"
          :page-size="queryInfo.limit"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.page"
        >
        </el-pagination> -->
    </el-card>
  </div>
</template>

<script>
// api
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getHandleLogList } = require(`@/v2/${PROCESS_NAME}/api/dns/record`)

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        domain: this.$route.params.domain,
        page: 1, // 当前的页数
        limit: 50 // 当前每页显示多少条数据
      },
      goodsList: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      this.$root.loading = true
      const { data: res } = await getHandleLogList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      this.goodsList = res.data.map(item => {
        return JSON.parse(item)
      })
      console.log(this.goodsList)
      this.total = this.goodsList.length || 0
    },

    /**
     * @description: 删除日志
     * @param {*} row
     */

    async deleteLog(row) {
      //   const { data } = await this.$http.post(
      //     '',
      //     this.$qs.stringify({
      //       id: row.id,
      //       sort: this.queryInfo.sort
      //     })
      //   )
      //   if (data.code !== 1) return this.$msg.error('删除日志失败')
      //   this.getGoodsList()
      //   this.$msg.success('删除日志成功')
    },

    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.limit = newSize
      this.getGoodsList()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.getGoodsList()
    },

    handleSelectionChange(val) {}
  }
}
</script>
