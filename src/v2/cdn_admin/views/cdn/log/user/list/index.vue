<template>
  <el-card class="log_user_box content-box animated fadeIn">
    <table-query-form
      :search-arr="[
        {
          name: '检索用户名',
          key: 'user',
          value: queryInfo.user
        },
        {
          name: '检索IP地址',
          key: 'ip',
          value: queryInfo.ip
        }
      ]"
      :queryInfo="queryInfo"
      :pagenumKey="'page'"
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
          text="导出日志"
          :disabled="$root.loading"
          :loading="btnLoading"
          @click="toDownload()"
        />

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
      :row-class-name="tableRowClassName"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column type="selection" width="45" align="center">
      </ants-table-column>
      <ants-table-column label="用户" min-width="100">
        <template #default="{ row }">
          <div>ID：{{ row.userId }}</div>
          <div>{{ row.username }}</div>
        </template>
      </ants-table-column>
      <ants-table-column
        prop="createDate"
        sortable
        label="时间"
        min-width="140"
      >
      </ants-table-column>
      <ants-table-column prop="ip" label="IP 地址" min-width="140">
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
      <ants-table-column prop="area" label="区域" min-width="140">
      </ants-table-column>
      <ants-table-column prop="method" label="日志信息" min-width="220">
      </ants-table-column>
      <ants-table-column label="状态" width="100">
        <template #default="{ row }">
          {{ row.state == 0 ? '用户已删除' : '正常' }}
        </template>
      </ants-table-column>
      <ants-table-column label="操作" width="100">
        <template #default="{ row }">
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
</template>

<script>
// API
import { getAdminLogList, doDeleteLog } from '@/v2/cdn_admin/api/cdn/log'
import { exportXlsx } from '@/utils/export'

const logTypeName = {
  1: '登录日志',
  2: '操作日志',
  3: '套餐日志',
  4: '财务日志',
  0: '其他日志'
}

export default {
  data() {
    return {
      selectArr: [], // 批量操作勾选数据

      total: 0,
      queryInfo: {
        // 1 = 管理员， 2 = 用户
        userType: 2,
        // 0 = 其他， 1 = 登录日志， 2 = 操作， 3 = 产品， 4 = 财务， 5 = 调度
        logType: +this.$route.query.logType || 1, // 分类
        username: '', // 筛选 用户名
        ip: '',
        key: '',
        start_date: '',
        end_date: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      btnLoading: false
    }
  },
  created() {
    this.getTableData()
  },
  watch: {
    // 监听路由地址参数的改变
    '$route.query.logType': function(newVal, oldVal) {
      this.queryInfo.logType = +newVal || 1
      this.queryInfo.page = 1
      this.tableData = []
      this.total = 0
      this.getTableData()
    }
  },
  methods: {
    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 状态设置
    tableRowClassName({ row, rowIndex }) {
      if (row.state === 0) {
        return 'delete-row'
      }
      return ''
    },

    // 获取用户日志数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getAdminLogList({
          ...this.queryInfo,
          page: this.queryInfo.page + '',
          limit: this.queryInfo.limit + ''
        })
        if (res.code !== 1) return
        const obj = res.page || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 单个删除日志
    async singleDelete({ id }) {
      const result = await this.$doDelete({
        tag: '日志'
      })
      if (!result) return

      const { data: res } = await doDeleteLog({
        ids: id
      })

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除日志成功')
    },

    // 批量删除日志
    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '日志'
      })
      if (!result) return

      this.btnLoading = true

      try {
        const arr = this.selectArr.map(item => item.id)
        const { data: res } = await doDeleteLog({
          ids: arr + ''
        })
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success('清除日志成功')
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
        content: `是否导出 ${this.total} 条用户${
          logTypeName[this.queryInfo.logType]
        }？`,
        type: 'info'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await getAdminLogList({
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
          state: item.state == 0 ? '已删除' : '正常',
          userId: item.userId,
          username: item.username
        }
      })

      // 追加表头
      jsonArr.unshift({
        id: 'ID',
        createDate: '时间',
        ip: 'IP地址',
        area: '区域',
        method: '日志信息',
        state: '状态',
        userId: '用户ID',
        username: '用户名'
      })

      const res = await exportXlsx(
        jsonArr,
        `CDN系统用户${logTypeName[this.queryInfo.logType]}`
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
  .delete-row {
    background: theme('colors.ants-bg-4');
    color: theme('colors.ants-text-4');
  }
  .ip_item_box {
    padding-top: 6px;
    line-height: 1;
  }
  .ip_item_box:first-child {
    padding-top: 0;
  }
}
</style>
