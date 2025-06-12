<template>
  <div class="rights_container">
    <el-card class="content-box animated fadeIn">
      <table-query-form>
        <template slot="buttons">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="
              showUpdateMenuDialog(
                {
                  menuId: 0, // 父ID
                  type: 0, // 菜单等级
                  url: '/'
                },
                'create'
              )
            "
            >添加顶级菜单</el-button
          >
        </template>
      </table-query-form>

      <ants-table
        :data="rightsList"
        @getTableData="getMenuList"
        :row-key="addRowKey"
        :tree-props="{ children: 'list', hasChildren: 'hasChildren' }"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column
          label="菜单名称"
          prop="name"
          min-width="140"
        ></ants-table-column>
        <ants-table-column label="路径" prop="url" min-width="140">
          <template #default="{ row }">
            {{ row.url || '--' }}
          </template>
        </ants-table-column>
        <ants-table-column label="图标" prop="icon" min-width="140">
          <template #default="{ row }">
            <span :class="['tabel_span_icon', row.icon]"> </span>
            {{ row.icon }}
          </template>
        </ants-table-column>

        <ants-table-column label="菜单等级" prop="type" min-width="80">
          <template #default="{ row }">
            <el-tag v-if="row.type == 0" size="mini">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="row.type == 1"
              >二级</el-tag
            >
            <el-tag type="danger" size="mini" v-else>三级</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column
          label="排序"
          prop="orderNum"
          min-width="60"
        ></ants-table-column>

        <ants-table-column label="操作" width="170" auto-fixed>
          <template #default="{ row }">
            <!-- 权限增删改 start -->
            <PowerPopover
              ref="PowerPopoverRef"
              :menu-row-data="row"
              :permissions-list="permissionsList"
              @getMenuList="getMenuList"
            />
            <!-- 权限增删改 end -->

            <el-button
              size="mini"
              type="success"
              @click="showUpdateMenuDialog(row, 'create')"
              icon="el-icon-plus"
              circle
            ></el-button>

            <el-button
              size="mini"
              type="primary"
              @click="showUpdateMenuDialog(row, 'update')"
              icon="el-icon-edit"
              circle
            ></el-button>

            <el-button
              size="mini"
              type="danger"
              @click="deleteMenu(row)"
              icon="el-icon-delete"
              circle
            ></el-button>
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加 - 修改菜单对话框弹窗 -->
    <UpdateDialog ref="UpdateDialogRef" />
  </div>
</template>

<script>
// api
import {
  getMenuNav,
  getPermsList,
  doDeleteMenu
} from '@/v2/dns_admin/api/account/power'

import UpdateDialog from './UpdateDialog'
import PowerPopover from './PowerPopover'

export default {
  components: {
    UpdateDialog,
    PowerPopover
  },
  data() {
    return {
      rightsList: [],
      total: 0,
      queryInfo: {
        pagenum: 1,
        pagesize: 50
      },

      // 权限列表
      permissionsList: []
    }
  },
  created() {
    this.getMenuList()
    this.getPermissinsList()
  },
  methods: {
    /**
     * @description: 获取菜单列表
     */

    async getMenuList() {
      this.$root.loading = true
      const { data: res } = await getMenuNav()

      this.$root.loading = false
      if (res.code !== 1) return

      this.rightsList = res.menuList || []
      this.total = res.menuList.length || 0
    },

    /**
     * @description: 获取权限列表
     */

    async getPermissinsList() {
      const { data: res } = await getPermsList()
      if (res.code !== 1) return
      this.permissionsList = res.data || []
    },

    /**
     * @description: 点击添加修改菜单
     * @param {*} row
     */

    showUpdateMenuDialog(row, type) {
      this.$refs.UpdateDialogRef.showUpdateDialog(row, type)
    },

    /**
     * @description: 删除菜单
     * @param {*} row
     */

    async deleteMenu({ name, menuId }) {
      const result = await this.$doDelete({
        name: name,
        tag: '菜单'
      })
      if (!result) return

      const { data: res } = await doDeleteMenu(menuId)

      if (res.code !== 1) return
      this.getMenuList()
      this.$msg.success('删除菜单成功')
    },

    /* 权限增删改部分
      -------------------------------------------------------------- */
    /**
     * @description: 自定义展开行，显示说明信息模块
     * @param {*} row
     */
    // 指定要当前展开行的值为 id
    addRowKey(row) {
      return row.menuId
    }
  }
}
</script>

<style lang="scss">
.rights_container {
  .ants_dialog {
    .el-input-number {
      width: 190px;
      .el-input {
        width: 190px;
      }
    }
  }
  .tabel_span_icon {
    font-size: 16px;
    vertical-align: middle;
  }
}
</style>
