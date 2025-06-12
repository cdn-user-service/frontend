<template>
  <ants-dialog
    :title="`IP管理【${parentGroupObj.remark}】`"
    v-model="dialogVisible"
    width="1000px"
    ref="dialogRef"
    top="5vh"
    @reset="resetFrom"
  >
    <table-query-form
      class="-mt-df mb-df"
      :search-arr="[
        {
          name: '检索IP',
          key: 'ip',
          value: queryInfo.ip
        }
      ]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
    </table-query-form>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column label="IP" prop="ip" min-width="140">
      </ants-table-column>

      <ants-table-column label="备注信息" prop="remark" min-width="140">
      </ants-table-column>
      <ants-table-column label="类型" min-width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="controlObj[+row.control].type">{{
            controlObj[+row.control].name
          }}</el-tag>
        </template>
      </ants-table-column>

      <ants-table-column prop="createTime" label="更新时间" min-width="140">
      </ants-table-column>
    </ants-table>
    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        text="关 闭"
        @click="dialogVisible = false"
      />
    </template>
  </ants-dialog>
</template>

<script>
// API
import { getIpControlList } from '@/v2/cdn_admin/api/cdn/ip'

export default {
  props: {
    // 类型
    controlObj: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      total: 0,
      queryInfo: {
        group: 0,
        parentId: 0,
        // 分组类型： -1 = 所有, 0 = 未定义, 1 = 白名单（7层）, 2 = 7层黑名单, 3 = 3层黑名单
        control: -1,
        ip: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: 20
      },
      // 父分组数据
      parentGroupObj: {},
      // 表格数据
      tableData: []
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     * @param {*} row
     */
    showDialog(row = {}) {
      this.dialogVisible = true
      // 数据初始化
      this.tableData = []
      this.total = 0
      this.queryInfo.ip = ''
      this.queryInfo.page = 1
      this.queryInfo.parentId = row.id
      this.queryInfo.control = row.control

      this.parentGroupObj = {
        ...row
      }
      this.getTableData()
    },

    /**
     * @description: 根据 parentId 获取表格数据
     */

    async getTableData() {
      this.$refs.dialogRef.bodyLoading = true
      const { data: res } = await getIpControlList(this.queryInfo)
      this.$refs.dialogRef.bodyLoading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      this.tableData = obj.list || []
      this.total = obj.totalCount || 0
    },

    // 对话框关闭，数据重置
    resetFrom() {}
  }
}
</script>
