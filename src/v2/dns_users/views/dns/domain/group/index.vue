<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索分组名称',
            key: 'key',
            value: queryInfo.key
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
            :disabled="$root.loading"
            text="添加分组"
          />
          <!-- <ants-button
              type="info"
              size="small"
              icon="el-icon-delete"
              :disabled="$root.loading"
              @click="batchDelete"
              text="批量删除"
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
              {{ getDomainLength(row.domainIds) }}
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

        <ants-table-column label="操作" width="230">
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

    <CreateUpdate ref="CreateUpdateRef" />
    <ChangeGroupDialog ref="ChangeGroupDialogRef" />
  </div>
</template>

<script>
// API
import {
  getDomainGroupList,
  doDeleteDomainGroup
} from '@/v2/dns_users/api/dns/domain'

import CreateUpdate from './CreateUpdateDialog'
import ChangeGroupDialog from './ChangeGroupDialog'
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
        key: '',
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
    /**
     * @description: 获取分组数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getDomainGroupList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      console.log(res)
      this.tableData = res.data && res.data.list
      this.total = res.data && res.data.totalCount
    },

    getDomainLength(domainIds = '') {
      if (!domainIds) return 0
      return domainIds.split(',').length
    },

    // 添加修改对话框显示
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateRef.showDialog(row)
    },

    showGroupDialog(row = {}) {
      this.$refs.ChangeGroupDialogRef.showDialog(row)
    },

    /**
     * @description: 删除单个
     * @param {*} row
     */

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

    /**
     * @description: 批量清除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '日志'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      //   const { data: res } = await doDelete({
      //     ids: idsArr + ''
      //   })

      //   this.btnLoading = false

      //   if (res.code !== 1) return
      //   this.getTableData()
      //   this.$msg.success(selectLength + this.antsT('个日志已成功删除 '))
      //   this.selectArr = [] // 释放
    }
  }
}
</script>
