<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索备注信息',
            key: 'remark',
            value: queryInfo.remark
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="showUpdateDialog()"
            text="添加线路转发"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="bulkDelete()"
            text="批量删除"
          />
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
        ></ants-table-column>
        <ants-table-column width="80" label="ID" prop="id"></ants-table-column>
        <ants-table-column
          min-width="140"
          label="起始IP"
          prop="sourceIpS"
        ></ants-table-column>
        <ants-table-column
          min-width="140"
          label="截止IP"
          prop="sourceIpE"
        ></ants-table-column>
        <ants-table-column
          min-width="140"
          label="线路名称"
          prop="lineName"
        ></ants-table-column>
        <ants-table-column min-width="200" label="转发DNS服务器" prop="targetValue">
        </ants-table-column>
        <ants-table-column
          min-width="140"
          label="备注"
          prop="remark"
        ></ants-table-column>
        <ants-table-column
          min-width="140"
          label="创建时间"
          prop="createTime"
        ></ants-table-column>
        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="showUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <CreateDialog ref="CreateDialogRef" />
  </div>
</template>

<script>
// API
import {
  getDnsRecursive,
  deleteDnsRecursive
} from '@/v2/dns_admin/api/dns/recursion'

import CreateDialog from './CreateDialog.vue'
export default {
  components: {
    CreateDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        key: '', // 搜索框内容
        mode: 3,
        page: 1, // 当前的页数
        remark: '',
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      btnLoading: false
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getDnsRecursive(this.queryInfo)
      this.$root.loading = false

      if (res.code !== 1) return
      const obj = res.data || {}
      const arr = (obj.list || []).map(item => {
        return {
          ...item,
          sourceIpS: this.numToIp(item.sourceIpS),
          sourceIpE: this.numToIp(item.sourceIpE)
        }
      })

      this.total = obj.totalCount || 0
      this.tableData = arr
    },

    // 整数转IP
    numToIp(num) {
      const tt = []
      tt[0] = (num >>> 24) >>> 0
      tt[1] = ((num << 8) >>> 24) >>> 0
      tt[2] = (num << 16) >>> 24
      tt[3] = (num << 24) >>> 24

      return tt.join('.')
    },

    handleSelectionChange(val = []) {
      this.selectArr = val
    },

    // 添加修改
    showUpdateDialog(row = {}) {
      this.$refs.CreateDialogRef.showDialog(row)
    },

    // 批量删除
    async bulkDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '转发域名'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map(e => e.id)
      const { data: res } = await deleteDnsRecursive({
        ids: idsArr + ''
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
      this.selectArr = [] // 释放
    },

    // 删除
    async singleDelete(row) {
      const result = await this.$doDelete({
        tag: '转发域名'
      })
      if (!result) return
      // 发起请求
      const { data } = await deleteDnsRecursive({
        ids: row.id
      })
      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
    }
  }
}
</script>
