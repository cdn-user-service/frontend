<template>
  <div
    style="max-width:620px;"
    class="mx-auto"
  >
    <TitleBorder>
      域名：<strong>{{ pForm.domain }}</strong>
    </TitleBorder>

    <el-table
      :data="tableData"
      border
      size="mini"
      row-key="id"
      ref="tableRef"
      @selection-change="onSelectionChange"
      @row-click="onRowClick"
      v-loading="loading"
    >
      <!-- <el-table-column
        type="selection"
        align="center"
        width="45"
      /> -->
      <ants-table-column
        width="150"
        label="主机记录"
        prop="top"
      >
        <template #default="{ row }">
          <el-radio
            v-model="currentRow.id"
            :label="row.id"
          >
            {{ row.top }}
          </el-radio>
        </template>
      </ants-table-column>
      <ants-table-column
        width="120"
        label="记录类型"
        prop="record_type"
      >
      </ants-table-column>
      <ants-table-column
        width="120"
        label="线路类型"
        prop="record_line_name"
      >
      </ants-table-column>
      <ants-table-column
        min-width="140"
        label="记录值"
        prop="value"
      >
      </ants-table-column>
      <ants-table-column
        width="68"
        label="轮询IP"
        prop="pollIpCount"
      >
      <template #default="{ row }">
        {{ row.pollIpCount }}个
      </template>
      </ants-table-column>
    </el-table>
  </div>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getList } = require(`@/v2/${PROCESS_NAME}/api/dns/record`)

export default {
  props: {
    // 表单
    pForm: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',

      loading: false,
      tableData: [],
      selectArr: [],
      currentRow: {}
    }
  },
  methods: {
    // 查询表格数据
    async getTableData() {
      const { domain, domainId } = this.pForm
      console.log(this.pForm)
      if (!domain) {
        return this.$msg.error('未选择域名')
      }
      this.selectArr = []
      // 清除已勾选
      this.$refs.tableRef.clearSelection()

      this.loading = true
      try {
        const { data: res } = await getList({
          // 后台需要
          domain,
          // 前台需要
          id: domainId
        })
        this.loading = false
        if (res.code !== 1) return
        const recordArr = res.objData || []

        // 过滤出 A 记录、CNAME 记录、AAAA 记录
        const newRecordArr = recordArr.filter((item) => {
          return ['A', 'CNAME', 'AAAA'].includes(item.record_type) && item.taskStatus == 0
        })

        // 排序
        this.tableData = newRecordArr.sort(this.compareNum)
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    /**
     * @description: 列表按记录类型排序, ns 记录要排在首位
     */

    compareNum(x, y) {
      // NS 排在最前面
      if (y.record_type == 'NS') return 1
      if (x.record_type == 'NS') return -1

      // 按记录类型排序
      if (x.record_type < y.record_type) return -1
      if (x.record_type > y.record_type) return 1

      // 按主机记录排序
      if (x.record_type == y.record_type) {
        if (x.top < y.top) return -1
        if (x.top > y.top) return 1
        return 0
      }
    },

    // 点击
    onRowClick(row) {
      this.currentRow = row
    },

    // 点击下一步，提交
    submit(callback) {
      // if (!this.selectArr.length) {
      //   callback()
      //   return this.$msg.error('请选择记录')
      // }
      // callback(this.selectArr.map((item) => item.id))

      if (!this.currentRow.id) {
        callback()
        this.$msg.error('请选择记录')
        return
      }
      callback(this.currentRow)
    },

    // 勾选操作
    onSelectionChange(val) {
      this.selectArr = val || []
    },

    // 重置
    resetForm() {}
  }
}
</script>
