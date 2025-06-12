<template>
  <div class="man_list_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索角色名称',
            key: 'roleName',
            value: queryInfo.roleName
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getGoodsList"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="showUpdateRoleDialog()"
            text="添加角色"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="goodsList"
        @getTableData="getGoodsList"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column
          label="ID"
          prop="roleId"
          width="50"
        ></ants-table-column>
        <ants-table-column label="角色名称" prop="roleName" min-width="140">
        </ants-table-column>

        <ants-table-column label="角色描述" prop="remark" min-width="140">
        </ants-table-column>
        <ants-table-column
          label="创建时间"
          sortable
          prop="createTime"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column label="权限值" sortable min-width="100">
          <template #default="{ row }">
            {{ row.menuIdList ? row.menuIdList.length : '--' }}
          </template>
        </ants-table-column>

        <ants-table-column
          label="操作"
          auto-fixed
          width="210"
        >
          <template #default="{ row }">
            <el-button
              size="mini"
              type="success"
              @click="showUpdateRightsDialog(row)"
              >权限</el-button
            >
            <el-button
              size="mini"
              type="primary"
              @click="showUpdateRoleDialog(row)"
              >编辑</el-button
            >

            <el-button
              size="mini"
              :type="$root.userinfo.userId === row.userId ? 'info' : 'danger'"
              :disabled="$root.userinfo.userId === row.userId"
              @click="deleteUser(row)"
              >删除</el-button
            >
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加-编辑角色对话框弹窗 -->
    <UpdateDialog ref="UpdateDialogRef" />

    <!-- 分配权限对话框 -->
    <RightsDialog ref="RightsDialogRef" />
  </div>
</template>

<script>
// api
import { getRoleList, doDeleteRole } from '@/v2/dns_admin/api/account/power'

import UpdateDialog from './UpdateDialog'
import RightsDialog from './RightsDialog'

export default {
  components: {
    UpdateDialog,
    RightsDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        roleName: '', // 搜索框内容
        // sidx: 'id', // 排序字段
        // order: 'desc', // 排序方式，asc 倒叙， desc正序
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      goodsList: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    /**
     * @description: 获取角色列表数据
     */

    async getGoodsList() {
      this.$root.loading = true
      const { data: res } = await getRoleList(this.queryInfo)

      this.$root.loading = false

      if (res.code !== 1) return

      this.goodsList = res.page.list || []
      this.total = res.page.totalCount || 0
    },

    /**
     * @description: 点击添加-修改角色员信息
     * @param {*} row
     */

    async showUpdateRoleDialog(row = {}) {
      this.$refs.UpdateDialogRef.showUpdateDialog(row)
    },

    /**
     * @description: 点击分配权限,获取菜单列表
     * @param {*} row
     */

    async showUpdateRightsDialog(row) {
      this.$refs.RightsDialogRef.showRightsDialog(row)
    },

    /**
     * @description: 删除角色
     * @param {*} row
     */

    async deleteUser(row) {
      const result = await this.$doDelete({
        name: row.roleName,
        tag: '角色'
      })
      if (!result) return

      const { data: res } = await doDeleteRole([row.roleId])

      if (res.code !== 1) return
      this.getGoodsList()
      this.$msg.success('删除角色成功')
    },

    /**
     * @description: 启用禁用角色
     * @param {*} row
     */

    async changeUserStatus(row) {
      let txt = '启用'
      // 禁用
      if (!row.status) {
        const confirmResult = await this.$confirm('禁用角色员', {
          title: '禁用角色员',
          message: '该操作将禁用角色员：' + row.roleName + ' ，是否继续？',
          type: 'warning',
          center: true
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          row.status = 1
          this.$msg.info('已取消禁用该角色员')
          return
        }
        txt = '禁用'
      }

      const { data: res } = await this.$http.post('', {
        userId: row.userId,
        roleName: row.roleName,
        mobile: row.mobile,
        email: row.email,
        status: row.status // 传 1表示启用, 0表示禁用
      })

      if (res.code !== 1) {
        if (!row.status) {
          row.status = 1
        } else {
          row.status = 0
        }
        this.$msg.error(res.msg || txt + '角色员失败')
        return
      }
      this.$msg.success(txt + '角色员成功')
    }
  }
}
</script>
