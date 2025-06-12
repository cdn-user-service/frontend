<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索黑名单域名',
            key: 'key',
            value: queryInfo.key
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
            text="添加黑名单域名"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            :disabled="$root.loading"
            @click="batchDelete"
            text="批量删除"
          />
        </template>
        <template slot="inputs">
          <el-select
            size="small"
            v-model="queryInfo.blModes"
            placeholder="处理方式"
            style="width: 120px;"
            class="mr-sm"
            @change="getTableData"
          >
            <ants-option value=" " label="全部方式" />
            <ants-option value="1" label="指定CNAME" />
            <ants-option value="2" label="随机回复" />
          </el-select>
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
          label="黑名单域名"
          prop="blObj"
        ></ants-table-column>
        <ants-table-column min-width="80" label="分类" prop="label">
          <template #default="{ row }">
            <el-tag size="small" type="danger">{{ row.label }}</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column min-width="100" label="处理方式" prop="blMode">
          <template #default="{ row }">
            <el-tag size="small" type="success" v-if="row.blMode === 2"
              >随机回复</el-tag
            >
            <el-tag v-else-if="row.blMode === 1" size="small" type="primary"
              >指定CNAME</el-tag
            >
          </template>
        </ants-table-column>
        <ants-table-column min-width="140" label="指定CNAME" prop="returnParam">
          <template #default="{ row }">
            {{ row.returnParam || '-' }}
          </template>
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

    <CreateUpdate ref="CreateUpdateRef" />
  </div>
</template>

<script>
// API
import { getBlackList, doDeleteBlackList } from '@/v2/dns_admin/api/dns/black'

import CreateUpdate from './CreateUpdate.vue'
export default {
  components: {
    CreateUpdate
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        key: '', // 搜索框内容
        // 处理方式 1， 2
        blModes: ' ',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
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
      const { data: res } = await getBlackList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      console.log(res)
      this.tableData = obj.records || []
      this.total = obj.total || 0
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 添加修改
    showUpdateDialog(row = {}) {
      this.$refs.CreateUpdateRef.showDialog(row)
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '黑名单域名'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map(e => e.id)
      const { data: res } = await doDeleteBlackList({
        ids: idsArr + ''
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     */

    async singleDelete({ groupName, id }) {
      const result = await this.$doDelete({
        name: groupName,
        tag: '黑名单域名'
      })
      if (!result) return
      this.btnLoading = true
      const { data: res } = await doDeleteBlackList({
        ids: id
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
    }
  }
}
</script>
