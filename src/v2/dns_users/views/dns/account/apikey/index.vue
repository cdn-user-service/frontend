<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索备注信息',
            key: 'key',
            value: queryInfo.key
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getGoodsList"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            icon="el-icon-plus"
            @click="showCreateApikeyDialog"
            size="small"
            text="添加密钥"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            @click="batchDeleteLogList"
            text="批量删除"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getGoodsList"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>
        <ants-table-column prop="id" label="APPID" min-width="120">
        </ants-table-column>
        <ants-table-column prop="secretKey" label="密钥" min-width="300">
          <template #default="{ row }">
            <div>
              <span class="text-ants-text-4">SecretId：</span>
              <ants-copy :text="row.secretId" />
            </div>
            <div>
              <span class="text-ants-text-4">SecretKey：</span>
              <ants-copy :text="row.secretKey" />
            </div>
          </template>
        </ants-table-column>
        <ants-table-column
          prop="createtime"
          sortable
          label="创建时间"
          min-width="140"
        >
        </ants-table-column>
        <ants-table-column prop="name" label="备注信息" min-width="140">
        </ants-table-column>

        <ants-table-column label="启用" width="100">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#F52443"
              active-color="#13ce66"
              :ref="`tableSwitchRef${$index}`"
              @change="toggleStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="100">
          <template #default="{ row }">
            <ants-button
              type="danger"
              size="mini"
              @click="deleteLog(row)"
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
// api
import {
  getList,
  doDelete,
  doUpdateStatus
} from '@/v2/dns_users/api/dns/apikey'

import CreateDialog from './CreateDialog'
export default {
  components: {
    CreateDialog
  },
  data() {
    return {
      selectArr: [], // 批量操作勾选数据
      btnLoading: false,

      total: 0,
      queryInfo: {
        key: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description: 获取API 密钥数据
     */

    async getGoodsList() {
      this.$root.loading = true
      const { data: res } = await getList({
        key: this.queryInfo.key,
        page: this.queryInfo.page + '',
        limit: this.queryInfo.limit + ''
      })

      this.$root.loading = false

      if (res.code !== 1) return
      this.tableData = res.data.list || []
      this.total = res.data.totalCount || 0
    },

    /**
     * @description: 添加密钥
     */

    showCreateApikeyDialog() {
      this.$refs.CreateDialogRef.dialogVisible = true
    },

    /**
     * @description: 启用禁用
     * @param {*} row
     */

    async toggleStatus(row, switchRef) {
      this.$refs[switchRef].loading = true

      const { data: res } = await doUpdateStatus({
        id: row.id
      })
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        this.getGoodsList()
        return
      }

      this.$msg.success('操作成功')
    },

    /**
     * @description: 删除API 密钥单个
     * @param {*} row
     */

    async deleteLog(row) {
      const result = await this.$doDelete({
        tag: 'API 密钥'
      })
      if (!result) return

      const { data } = await doDelete({
        ids: row.id + ''
      })
      if (data.code !== 1) return
      this.getGoodsList()
      this.$msg.success(this.antsT('删除API 密钥成功'))
    },

    /**
     * @description: 批量清除API 密钥
     */

    async batchDeleteLogList() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: 'API 密钥'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      const { data: res } = await doDelete({
        ids: idsArr + ''
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.getGoodsList()
      this.$msg.success(selectLength + this.antsT('个API 密钥已成功删除 '))
      this.selectArr = [] // 释放
    }
  }
}
</script>
