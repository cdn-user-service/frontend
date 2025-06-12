<template>
  <div class="log_users_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :queryInfo="queryInfo"
        @changeInput="getTableData"
        :show-date-picker="true"
        startDateKey="start_date"
        endDataKey="end_date"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            icon="el-icon-download"
            size="small"
            text="导出日志"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="toDownload()"
          />
          <!-- <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            @click="batchDeleteLogList"
            text="批量删除"
          /> -->
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
          prop="createDate"
          sortable
          label="时间"
          min-width="140"
        >
        </ants-table-column>
        <ants-table-column prop="ip" label="IP" min-width="140">
          <template #default="{ row }">
            <div
              class="ip_item_box"
              v-for="(item, idx) in (row.ip || '').split(',')"
              :key="idx"
            >
              {{ item }}
            </div>
          </template>
        </ants-table-column>
        <ants-table-column prop="area" label="区域" min-width="150">
        </ants-table-column>
        <ants-table-column prop="operation" label="日志信息" min-width="160">
        </ants-table-column>
        <ants-table-column label="状态" width="100">
          <template #default="{ row }">
            {{ row.state == 0 ? anstT('已删除') : antsT('正常') }}
          </template>
        </ants-table-column>
        <!-- <ants-table-column label="操作" width="100">
          <template #default="{ row }">
            <ants-button
              type="info"
              size="mini"
              @click="deleteLog(row)"
              text="删除"
            />
          </template>
        </ants-table-column> -->
      </ants-table>
    </el-card>
  </div>
</template>

<script>
// api
import { getList, doDelete } from '@/v2/dns_users/api/dns/log'
import { exportXlsx } from '@/utils/export'

const logTypeName = {
  0: '登录日志',
  1: '操作日志',
  2: '套餐日志',
  3: '财务日志',
  '-1': '其他日志'
}

export default {
  data() {
    return {
      topInfo: '',
      selectArr: [], // 批量操作勾选数据
      btnLoading: false,

      total: 0,
      queryInfo: {
        user_type: 2, // 2 = 用户; 1 = 管理员
        // sidx: 'id', // 根据 ID 进行排序
        // order: 'desc', // desc 表示降序， asc表示升序
        // key: 'AppAccountController', // 筛选日志信息
        start_date: '',
        end_date: '',
        log_type: this.$route.params.method, // 0 = login; 1 = dns ; 2 = 产品; 3 = 财务
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.params': function (newVal, oldVal) {
      this.queryInfo.log_type = newVal.method
      this.tableData = []
      this.total = 0

      this.queryInfo.page = 1
      this.getTableData()
    }
  },
  methods: {
    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 获取日志数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 单个删除
    async deleteLog(row) {
      const result = await this.$doDelete({
        tag: '日志'
      })
      if (!result) return

      const { data } = await doDelete({
        ids: row.id
      })
      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除日志成功'))
    },

    // 批量清除日志
    async batchDeleteLogList() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '日志'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const idsArr = this.selectArr.map((item, index) => {
          return item.id
        })
        const { data: res } = await doDelete({
          ids: idsArr + ''
        })

        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(selectLength + this.antsT('个日志已成功删除 '))
        this.selectArr = [] // 释放
      } finally {
        this.btnLoading = false
      }
    },

    // 导出日志
    async toDownload() {
      if (this.total === 0) {
        return this.$msg.success(this.antsT('暂无日志数据'))
      }

      const result = await this.$doDelete({
        title: '导出日志',
        content: `是否导出 ${this.total} 条${
          logTypeName[this.queryInfo.log_type]
        }？`,
        type: 'info'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await getList({
          ...this.queryInfo,
          page: 1,
          limit: this.total
        })
        if (res.code !== 1) return
        this.doDownload((res.data || {}).list)
      } finally {
        this.btnLoading = false
      }
    },

    // 执行导出
    async doDownload(logArr = []) {
      this.btnLoading = true
      // 指定要导出的每列数据
      const jsonArr = logArr.map((item) => {
        return {
          id: item.id,
          createDate: item.createDate,
          ip: item.ip,
          area: item.area,
          operation: item.operation,
          state: item.state == 0 ? '已删除' : '正常'
        }
      })

      // 追加表头
      jsonArr.unshift({
        id: 'ID',
        createDate: '时间',
        ip: 'IP地址',
        area: '区域',
        operation: '日志信息',
        state: '状态'
      })

      const res = await exportXlsx(
        jsonArr,
        `DNS系统${logTypeName[this.queryInfo.log_type]}`
      )
      if (!res) return (this.btnLoading = false)
      setTimeout(() => {
        this.$msg.success('导出成功')
        this.btnLoading = false
      }, 500)
    }
  }
}
</script>

<style lang="scss">
.log_users_box {
  .ip_item_box {
    padding-top: 6px;
    line-height: 1;
  }
  .ip_item_box:first-child {
    padding-top: 0;
  }
}
</style>
