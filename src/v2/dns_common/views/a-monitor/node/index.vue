<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            size="small"
            type="success"
            icon="el-icon-refresh"
            :loading="$root.loading"
            @click="getTableData()"
            text="刷新"
          />

          <!-- <UploadXlsx /> -->
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column
          type="selection"
          align="center"
          width="45"
        />
        <ants-table-column
          width="80"
          label="ID"
          prop="id"
        />
        <ants-table-column
          min-width="150"
          label="节点"
          prop="ip"
        >
        </ants-table-column>
        <ants-table-column
          min-width="80"
          label="类型"
          prop="mtype"
        >
          <template #default="{ row }">
            <el-tag
              size="small"
              v-if="(row.mtype || '').indexOf('master') != -1"
              type="success"
            >master
            </el-tag>
            <el-tag
              size="small"
              v-else-if="(row.mtype || '').indexOf('slave') != -1"
              type="primary"
            >slave
            </el-tag>
          </template>
        </ants-table-column>
        <ants-table-column
          min-width="150"
          label="磁盘状态"
          prop="disk"
        >
          -
        </ants-table-column>

        <ants-table-column
          min-width="150"
          label="内存状态"
          prop="memory"
        >
          -
        </ants-table-column>

        <ants-table-column
          min-width="150"
          label="CPU状态"
          prop="cpu"
        >
          -
        </ants-table-column>

        <ants-table-column
          min-width="150"
          label="带宽"
          prop="bindwidth"
        >
          -
        </ants-table-column>

        <ants-table-column
          min-width="150"
          label="区域"
          prop="area"
        >
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
// API
import { getNodeList } from '@/v2/dns_admin/api/dns/a-monitor'
// import UploadXlsx from './UploadXlsx.vue'
export default {
  components: {
    // UploadXlsx
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        key: '',
        user: '',
        type: 'all',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],
      selectArr: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getNodeList(this.queryInfo)
        this.$root.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 前往添加监控任务
    toAdd() {
      this.$refs.FormDialogRef.show()
    },

    // 前往修改监控任务
    toEdit(row) {
      this.$refs.UpdateDialogRef.show({
        ...row,
        rdata: (row.recordInfo || {}).rdata
      })
    },

    // 删除
    async toDel(row) {},

    // 批量删除
    async doBatchDel() {},

    /**
     * @description: 开启-暂停解析
     * @param {*} row
     */

    async changeStatus(row) {}
  }
}
</script>
