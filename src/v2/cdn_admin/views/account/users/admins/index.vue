<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索管理员',
            key: 'username',
            value: queryInfo.username
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="showCreateUpdateDialog()"
            text="添加管理员"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :disabled="$root.loading"
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
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>
        <ants-table-column
          label="ID"
          prop="userId"
          width="60"
        ></ants-table-column>
        <ants-table-column label="管理员" prop="username" min-width="140">
          <template #default="{ row }">
            <ants-copy :text="row.username" />
          </template>
        </ants-table-column>
        <ants-table-column label="手机号" prop="mobile" min-width="130">
          <template #default="{ row }">
            {{ row.mobile || '--' }}
          </template>
        </ants-table-column>
        <ants-table-column label="邮箱" prop="email" min-width="120">
          <template #default="{ row }">
            {{ row.email || '--' }}
          </template>
        </ants-table-column>
        <ants-table-column label="角色" prop="roleIdList" min-width="120">
          <template #default="{ row }">
            <el-tag
              size="mini"
              type="primary"
              style="margin-right:4px;"
              v-for="item in row.roleNameList"
              :key="item.role_id"
            >
              {{ item.role_name }}
            </el-tag>
          </template>
        </ants-table-column>
        <ants-table-column
          label="创建时间"
          sortable
          prop="createTime"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column prop="starts" label="状态" min-width="60">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" auto-fixed width="150">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row)"
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

    <!-- 添加管理对话框弹窗 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" :role-list="roleList" />
  </div>
</template>

<script>
// API
import {
  getAdminList,
  doUpdateAdmin,
  doDeleteAdmin
} from '@/v2/cdn_admin/api/account/admins'

import { getNowRoleList } from '@/v2/cdn_admin/api/account/role'

import CreateUpdateDialog from './components/CreateUpdateDialog'

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        username: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      selectArr: [],
      tableData: [],
      roleList: [] // 角色列表数据
    }
  },
  created() {
    this.getTableData()
    this.getRoleListData()
  },
  methods: {
    /**
     * @description: 获取管理员列表数据
     */
    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getAdminList({
        // page, limit 要转为字符串类型
        page: this.queryInfo.page + '',
        limit: this.queryInfo.limit + '',
        username: this.queryInfo.username
      })
      this.$root.loading = false
      if (res.code !== 1) return

      this.tableData = res.page.list || []
      this.total = res.page.totalCount || 0
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description: 获取角色列表数据
     */

    async getRoleListData() {
      const { data: res } = await getNowRoleList()
      if (res.code !== 1) return
      this.roleList = res.list || []
    },

    /**
     * @description: 显示添加管理员对话框
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 启用禁用管理
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用管理员',
          content: `此操作将禁用管理员“ <strong style="color: #F78989;">${row.username}</strong> ”，是否继续？`
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      const { data: res } = await doUpdateAdmin(row)
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }
      this.$msg.success('操作成功')
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '管理员'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map(e => {
        return e.userId
      })

      const { data: res } = await doDeleteAdmin({
        ids: idsArr + ''
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除 ' + selectLength + ' 个管理员')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete({ userId, username }) {
      const result = await this.$doDelete({
        name: username,
        tag: '管理员'
      })
      if (!result) return
      this.btnLoading = true
      const { data: res } = await doDeleteAdmin({
        ids: userId
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除管理员成功')
    }
  }
}
</script>
