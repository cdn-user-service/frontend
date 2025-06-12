<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16">
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
            :pagenumKey="'page'"
            @changeInput="getTableData"
          >
            <template slot="buttons">
              <ants-button
                type="primary"
                size="small"
                icon="el-icon-plus"
                :disabled="$root.loading"
                @click="showCreateUpdateDialog()"
                text="添加角色"
              />
            </template>
          </table-query-form>

          <ants-table
            :data="tableData"
            @getTableData="getTableData"
            :total="total"
            :queryInfo="queryInfo"
            ref="tableRef"
            @row-click="rowClick"
            row-key="roleId"
            highlight-selection-row
            highlight-current-row
          >
            <ants-table-column
              label="ID"
              prop="roleId"
              width="50"
            ></ants-table-column>
            <ants-table-column label="角色名称" prop="roleName" min-width="140">
            </ants-table-column>

            <ants-table-column
              label="角色描述"
              prop="remark"
              show-overflow-tooltip
              min-width="160"
            >
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
                {{ row.menuIdList ? row.menuIdList.length : 0 }}
              </template>
            </ants-table-column>

            <ants-table-column label="操作" auto-fixed width="160">
              <template #default="{ row }">
                <!-- <ants-button
                  size="mini"
                  type="success"
                  :disabled="btnLoading"
                  @click="showUpdateRightsDialog(row)"
                  text="权限"
                /> -->
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
      </el-col>

      <el-col :span="8">
        <el-card class="content-box animated fadeIn">
          <div
            slot="header"
            class="font-semibold flex justify-between items-center"
          >
            <div>
              <TitleBorder title="菜单分配" />
              <div class="text-primary pt-2">
                <span>{{ currentRow.roleName }}</span>
              </div>
            </div>

            <ants-button
              type="primary"
              size="small"
              text="保存配置"
              icon="el-icon-check"
              :disabled="$root.loading"
              :loading="btnLoading"
              @click="toSaveMenu()"
            />
          </div>
          <div class="overflow-y-auto" style="max-height: calc(100vh - 250px)">
            <el-skeleton :loading="loading" animated :rows="8">
              <template>
                <el-tree
                  :data="menuList"
                  show-checkbox
                  node-key="menuId"
                  :accordion="true"
                  :check-strictly="false"
                  :default-checked-keys="checkedKeys"
                  :default-expanded-keys="expandedKeys"
                  ref="treeRef"
                  :props="{
                    // 树形结构属性绑定对象
                    children: 'list',
                    label: 'title'
                  }"
                >
                </el-tree>
              </template>
            </el-skeleton>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加-编辑角色对话框弹窗 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" />

    <!-- 分配权限对话框 -->
    <RightsDialog ref="RightsDialogRef" />
  </div>
</template>

<script>
// api
import {
  getRoleList,
  doDeleteRole,
  doUpdateRole
} from '@/v2/cdn_admin/api/account/role'
import { getMenuNav } from '@/v2/cdn_admin/api/account/menu'

import CreateUpdateDialog from './components/CreateUpdateDialog'
import RightsDialog from './components/RightsDialog'

export default {
  components: {
    CreateUpdateDialog,
    RightsDialog
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      total: 0,
      queryInfo: {
        roleName: '', // 搜索框内容
        // sidx: 'id', // 排序字段
        // order: 'desc', // 排序方式，asc 倒叙， desc正序
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      tableData: [],
      menuList: [],
      // 默认选中的子节点ID数值
      checkedKeys: [],
      // 默认展开的
      expandedKeys: [],

      // 当前选中行
      currentRow: {}
    }
  },
  created() {
    this.getTableData()
    this.getMenuList()
  },
  methods: {
    // 获取角色列表数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getRoleList({
          // page, limit 要转为字符串类型
          page: this.queryInfo.page + '',
          limit: this.queryInfo.limit + '',
          roleName: this.queryInfo.roleName
        })
        if (res.code !== 1) return
        const obj = res.page || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
        console.log(this.tableData)

        // 已勾选的菜单
        if (!this.tableData.length) {
          this.rowClick({})
          return
        }

        const curRow = this.tableData.filter(
          (item) => item.roleId === this.currentRow.roleId
        )
        const setRow = curRow[0] || this.tableData[0]
        this.$refs.tableRef.$children[0].setCurrentRow(setRow)
        this.checkedKeys = setRow.menuIdList || []
        this.currentRow = setRow

        if (this.checkedKeys.length) {
          this.resetCheckChild(this.menuList)
        }
      } finally {
        this.$root.loading = false
      }
    },

    // 获取菜单列表
    async getMenuList() {
      this.loading = true
      try {
        const { data: res } = await getMenuNav()
        if (res.code !== 1) return
        this.menuList = this.buildData(res.menuList || [])
        console.log(this.menuList)
        if (!this.menuList.length) return
        this.expandedKeys = [this.menuList[0].menuId]
      } finally {
        this.loading = false
      }
    },

    // 点点击表格行
    rowClick(row, column, event) {
      this.currentRow = row
      // 清除选中的节点
      this.$refs.treeRef && this.$refs.treeRef.setCheckedKeys([])
      // 设置默认选中的节点
      this.checkedKeys = row.menuIdList || []

      if (!row.roleId || !this.checkedKeys.length) return
      this.resetCheckChild(this.menuList)
    },

    resetCheckChild(list = []) {
      list.forEach((item) => {
        // 过滤出存在的节点
        item.list.forEach((item2) => {
          this.$nextTick(() => {
            this.$refs.treeRef &&
              this.$refs.treeRef.setChecked(
                item2.menuId,
                this.checkedKeys.includes(item2.menuId),
                false
              )
          })
        })

        if (item.list.length) {
          this.resetCheckChild(item.list)
        }
      })
    },

    // 递归解析列表
    buildData(list = [], parentUrl = '') {
      return list.map((item) => {
        // 完整的URL
        const trueUrl = item.parentId ? parentUrl + '/' + item.url : item.url
        const meta = JSON.parse(item.meta || '{}')
        return {
          ...item,
          meta: '',
          title: meta.title,
          trueUrl,
          list: (item.list || []).length
            ? this.buildData(item.list, trueUrl)
            : []
        }
      })
    },

    // 点击保存菜单配置
    async toSaveMenu() {
      if (!this.currentRow.roleId) {
        return this.$msg.error('未选择角色')
      }
      this.btnLoading = true
      try {
        const newKeys = [
          // 全选的
          ...this.$refs.treeRef.getCheckedKeys(),
          // 半选的
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const { data: res } = await doUpdateRole({
          roleId: this.currentRow.roleId,
          roleName: this.currentRow.roleName,
          remark: this.currentRow.remark,
          menuIdList: newKeys
        })
        if (res.code !== 1) return
        this.$msg.success('保存成功')
        this.getTableData()
      } finally {
        this.btnLoading = false
      }
    },

    // 点击添加-修改角色员信息
    async showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    // 点击分配权限,获取菜单列表
    async showUpdateRightsDialog(row = {}) {
      this.$refs.RightsDialogRef.showDialog(row)
    },

    // 单个删除
    async singleDelete(row) {
      const result = await this.$doDelete({
        name: row.roleName,
        tag: '角色'
      })
      if (!result) return

      this.btnLoading = true
      const { data: res } = await doDeleteRole({
        ids: row.roleId
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除角色成功')
    },

    // 启用禁用角色
    async changeUserStatus(row) {
      let txt = '启用'
      // 禁用
      if (!row.status) {
        const confirmResult = await this.$confirm('禁用角色员', {
          title: '禁用角色员',
          message: '该操作将禁用角色员：' + row.roleName + ' ，是否继续？',
          type: 'warning',
          center: true
        }).catch((err) => err)
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

<style lang="scss" scoped></style>
