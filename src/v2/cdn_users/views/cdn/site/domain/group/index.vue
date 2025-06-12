<template>
  <div>
    <el-card class="animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索分组名称',
            key: 'name',
            value: queryInfo.name
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="showCreateUpdateDialog"
            text="添加分组"
            v-if="!$root.disabledCrud"
          />
          <!-- <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :disabled="$root.loading"
            @click="batchDelete"
            text="批量删除"
            v-if="!$root.disabledCrud"
          /> -->
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column width="60" prop="id" label="ID"> </ants-table-column>
        <ants-table-column prop="name" label="分组名称" min-width="140">
        </ants-table-column>
        <ants-table-column prop="remark" label="备注信息" min-width="140">
        </ants-table-column>
        <ants-table-column prop="domainIds" label="域名数" min-width="100">
          <template #default="{ row }">
            <el-tag size="mini" type="primary">
              {{ (row.siteList || []).length }}
            </el-tag>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="createTime"
          sortable
          label="创建时间"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column prop="weight" label="排序" min-width="100">
        </ants-table-column>

        <ants-table-column label="操作" width="230" v-if="!$root.disabledCrud">
          <template #default="{ row }">
            <ants-button
              type="success"
              size="mini"
              @click="showGroupDialog(row)"
              text="域名"
            />
            <ants-button
              type="primary"
              size="mini"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="deleteSingle(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <CreateUpdate ref="CreateUpdateRef" @refresh="getTableData" />
    <ChangeGroupDialog ref="ChangeGroupDialogRef" @refresh="getTableData" />
  </div>
</template>

<script>
// API
import {
  getDomainGroupList,
  doDeleteDomainGroup
} from '@/v2/cdn_users/api/cdn/site'

import CreateUpdate from './components/CreateUpdate.vue'
import ChangeGroupDialog from './components/ChangeGroupDialog.vue'
export default {
  components: {
    CreateUpdate,
    ChangeGroupDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        name: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  mounted() {},
  methods: {
    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getDomainGroupList(this.queryInfo)
        if (res.code !== 1) return
        console.log(res)
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 添加修改对话框显示
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateRef.showDialog(row)
    },

    // 域名管理
    showGroupDialog(row = {}) {
      this.$refs.ChangeGroupDialogRef.showDialog(row)
    },

    // 删除日志单个
    async deleteSingle(row) {
      const result = await this.$doDelete({
        tag: '分组'
      })
      if (!result) return

      const { data } = await doDeleteDomainGroup({
        ids: row.id
      })
      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除分组成功'))
    },

    // 批量删除
    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '分组'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      const { data: res } = await doDeleteDomainGroup({
        ids: idsArr + ''
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(selectLength + this.antsT('个分组已成功删除 '))
      this.selectArr = [] // 释放
    }
  }
}
</script>

<style lang="scss" scoped></style>
