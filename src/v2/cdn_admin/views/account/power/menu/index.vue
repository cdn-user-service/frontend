<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <table-query-form>
        <template slot="buttons">
          <ants-button
            v-if="debug"
            type="primary"
            size="small"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="
              showCreateUpdateDialog(
                {
                  menuId: 0, // 父ID
                  type: 0, // 菜单等级
                  url: '/'
                },
                'create'
              )
            "
            text="添加顶级菜单"
          />
        </template>
      </table-query-form>

      <ants-table
        v-if="debug"
        :data="tableData"
        @getTableData="getTableData"
        :row-key="addRowKey"
        :tree-props="{ children: 'list', hasChildren: 'hasChildren' }"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column label="菜单名称" prop="name" min-width="200">
          <template #default="{ row }">
            <i :class="row.meta.icon" class="text-2xl ml-2" />
            {{ row.meta.title }}
          </template>
        </ants-table-column>
        <ants-table-column label="菜单基础信息" prop="url" min-width="250">
          <template #default="{ row }">
            <div class="-my-2">
              <div>
                <span>路径：</span>
                {{ row.url || '-' }}
              </div>
              <div>
                <span>组件名：</span>
                {{ row.name || '-' }}
              </div>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="菜单类型" prop="isSub" min-width="150">
          <template #default="{ row }">
            <div class="-my-2">
              <div>
                <span>类型：</span>
                <span v-if="row.meta.isSub" class="text-success">
                  sub-menu
                </span>
                <span v-else class="text-primary">menu</span>
              </div>
              <div>
                <span>重定向：</span>
                {{ row.meta.redirect || '-' }}
              </div>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="是否隐藏" prop="hidden" width="100">
          <template #default="{ row }">
            <div>
              <span>是否隐藏：</span>
              <span v-if="row.meta.hidden" class="text-success">是</span>
            </div>
            <div>
              <span>是否缓存：</span>
              <span v-if="row.meta.cache" class="text-success">是</span>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="水平菜单" prop="hSub" width="200">
          <template #default="{ row }">
            <div class="-my-xs">
              <div>
                <span>水平菜单：</span>
                <span v-if="row.meta.hSub" class="text-success">是</span>
              </div>
              <div>
                <span>选中菜单：</span>
                <span v-if="row.meta.selectMenu" class="text-success">
                  {{ row.meta.selectMenu }}
                </span>
              </div>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="面包屑" prop="breadcrumb" min-width="200">
          <template #default="{ row }">
            <div class="-my-xs">
              <div>
                <span>面包屑：</span>
                {{ row.meta.hiddenBreadcrumb ? '隐藏' : '-' }}
              </div>
              <div>
                <span>返回URL：</span>
                {{ row.backUrl || '-' }}
              </div>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="Token" prop="noToken" width="140">
          <template #default="{ row }">
            <div class="-my-xs">
              <div>
                <span>Token：</span>
                <span v-if="row.meta.noToken" class="text-success">不验证</span>
              </div>
              <div>
                <span>管理访问：</span>
                <span v-if="row.meta.allowAdmin" class="text-success"
                  >可访问</span
                >
              </div>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="badge" width="120">
          <template #default="{ row }">
            <div class="-my-xs">
              <div>
                <span>badge：</span>
                {{ row.meta.badge }}
              </div>
              <div>
                <span>dot：</span>
                <span v-if="row.meta.dot" class="text-success">是</span>
              </div>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="其他" min-width="140">
          <template #default="{ row }">
            <div class="-my-xs">
              <div>
                <span>定制：</span>
                {{ row.meta.custom }}
              </div>
              <div>
                <span>other：</span>
                {{ row.meta.other }}
              </div>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          label="排序"
          prop="orderNum"
          min-width="60"
        ></ants-table-column>

        <ants-table-column label="操作" auto-fixed width="170">
          <template #default="{ row }">
            <el-button
              size="mini"
              type="success"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row, 'create')"
              icon="el-icon-plus"
              circle
            />

            <el-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row, 'update')"
              icon="el-icon-edit"
              circle
            />

            <el-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="deleteMenu(row)"
              icon="el-icon-delete"
              circle
            />

            <!-- 权限增删改 start -->
            <PowerPopover
              ref="PowerPopoverRef"
              :menu-row-data="row"
              :permissions-list="permissionsList"
              @getTableData="getTableData"
            />
            <!-- 权限增删改 end -->
          </template>
        </ants-table-column>
      </ants-table>

      <ants-table
        v-else
        :data="tableData"
        @getTableData="getTableData"
        :row-key="addRowKey"
        :tree-props="{ children: 'list', hasChildren: 'hasChildren' }"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column label="菜单名称" prop="name" min-width="250">
          <template #default="{ row }">
            <i :class="row.meta.icon" class="text-2xl ml-2" />
            {{ row.meta.title }}
          </template>
        </ants-table-column>

        <ants-table-column label="菜单路径" prop="url" min-width="250">
          <template #default="{ row }">
            {{ row.trueUrl }}
          </template>
        </ants-table-column>

        <ants-table-column
          label="排序"
          prop="orderNum"
          min-width="60"
        ></ants-table-column>

      </ants-table>
    </el-card>

    <!-- 添加 - 修改菜单对话框弹窗 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" />
  </div>
</template>

<script>
// api
import {
  getMenuNav,
  getPermsList,
  doDeleteMenu
} from '@/v2/cdn_admin/api/account/menu'

import CreateUpdateDialog from './components/CreateUpdateDialog'
import PowerPopover from './components/PowerPopover'

export default {
  components: {
    CreateUpdateDialog,
    PowerPopover
  },
  data() {
    return {
      btnLoading: false,
      tableData: [],
      total: 0,
      queryInfo: {
        pagenum: 1,
        pagesize: 20
      },

      // 权限列表
      permissionsList: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取菜单列表，需要一个meta参数，方便前台自定义路由
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getMenuNav()
        if (res.code !== 1) return
        this.permissionsList = res.permissions || []
        this.tableData = this.buildData(res.menuList || [])

        console.log(this.tableData)
        this.total = this.tableData.length || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 递归解析列表
    buildData(list = [], parentUrl = '') {
      return list.map(item => {
        // 完成的URL
        const trueUrl = item.parentId ? parentUrl + '/' + item.url : item.url
        return {
          ...item,
          meta: JSON.parse(item.meta || '{}'),
          trueUrl,
          list: (item.list || []).length
            ? this.buildData(item.list, trueUrl)
            : []
        }
      })
    },

    // 获取权限列表
    async getPermissinsList() {
      const { data: res } = await getPermsList()
      if (res.code !== 1) return
      this.permissionsList = res.data || []
    },

    // 点击添加修改菜单
    showCreateUpdateDialog(row = {}, type = '') {
      this.$refs.CreateUpdateDialogRef.showDialog(row, type)
    },

    // 单个删除菜单
    async deleteMenu({ name, menuId }) {
      const result = await this.$doDelete({
        name: name,
        tag: '菜单'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await doDeleteMenu(menuId)

        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success('删除菜单成功')
      } finally {
        this.btnLoading = false
      }
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
