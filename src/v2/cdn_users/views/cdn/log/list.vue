<template>
  <el-card class="animated fadeIn">
    <table-query-form
      :queryInfo="queryInfo"
      @changeInput="getTableData"
      :show-date-picker="true"
      :startDateKey="'start_date'"
      :endDataKey="'end_date'"
    >
      <template slot="buttons">
        <ants-button
          type="success"
          icon="el-icon-download"
          size="small"
          :disabled="$root.loading"
          :loading="btnLoading"
          @click="toDownload()"
          text="导出日志"
        />
        <!-- <ants-button
          type="info"
          size="small"
          icon="el-icon-delete"
          :loading="btnLoading"
          :disabled="$root.loading"
          @click="batchDelete"
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
          <ul class="space-y-2">
            <li v-for="item in (row.ip || '').split(',')" :key="item">
              {{ item }}
            </li>
          </ul>
        </template>
      </ants-table-column>
      <ants-table-column prop="area" label="区域" min-width="150">
      </ants-table-column>
      <ants-table-column prop="method" label="日志信息" min-width="160">
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
            :disabled="btnLoading"
            @click="singleDelete(row)"
            text="删除"
          />
        </template>
      </ants-table-column> -->
    </ants-table>
  </el-card>
</template>

<script>
// api
import { getLogList, doDeleteLog } from '@/v2/cdn_users/api/cdn/log'
import { exportXlsx } from '@/utils/export'

const logTypeName = {
  1: '登录日志',
  2: '操作日志',
  3: '套餐日志',
  4: '财务日志'
}

export default {
  data() {
    return {
      topInfo: '',
      selectArr: [], // 批量操作勾选数据
      btnLoading: false,

      total: 0,
      queryInfo: {
        // 1 = 管理员， 2 = 用户
        userType: 2,
        key: '',
        start_date: '',
        end_date: '',
        // 0 = login; 1 = dns ; 2 = 产品; 3 = 财务
        logType: +this.$route.query.logType || 1,
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.query.logType': function(newVal, oldVal) {
      this.queryInfo.logType = +newVal || 1
      this.tableData = []
      this.total = 0
      this.queryInfo.page = 1
      this.getTableData()
    }
  },
  methods: {
    // 获取日志数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getLogList({
          ...this.queryInfo,
          page: this.queryInfo.page + '',
          limit: this.queryInfo.limit + ''
        })

        if (res.code !== 1) return
        this.tableData = res.page.list || []
        this.total = res.page.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 删除日志单个
    async singleDelete(row) {
      const result = await this.$doDelete({
        tag: '日志'
      })
      if (!result) return
      this.btnLoading = true
      try {
        const { data } = await doDeleteLog({
          ids: row.id
        })
        if (data.code !== 1) return
        this.getTableData()
        this.$msg.success(this.antsT('删除日志成功'))
      } finally {
        this.btnLoading = false
      }
    },

    // 批量清除日志
    async batchDelete() {
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
        const { data: res } = await doDeleteLog({
          ids: idsArr + ''
        })

        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(selectLength + this.antsT('个日志已成功删除'))
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
          logTypeName[this.queryInfo.logType]
        }？`,
        type: 'info'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await getLogList({
          ...this.queryInfo,
          page: '1',
          limit: this.total + ''
        })
        if (res.code !== 1) return
        this.doDownload((res.page || {}).list)
      } finally {
        this.btnLoading = false
      }
    },

    // 执行导出
    async doDownload(logArr = []) {
      this.btnLoading = true
      // 指定要导出的每列数据
      const jsonArr = logArr.map(item => {
        return {
          id: item.id,
          createDate: item.createDate,
          ip: item.ip,
          area: item.area,
          method: item.method,
          state: item.state == 0 ? '已删除' : '正常'
        }
      })

      // 追加表头
      jsonArr.unshift({
        id: 'ID',
        createDate: '时间',
        ip: 'IP地址',
        area: '区域',
        method: '日志信息',
        state: '状态'
      })

      const res = await exportXlsx(
        jsonArr,
        `CDN系统${logTypeName[this.queryInfo.logType]}`
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
