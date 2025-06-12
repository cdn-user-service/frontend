<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '输入分组名称搜索',
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
            size="small"
            icon="el-icon-plus"
            @click="toCreateUpdate()"
            text="添加分组"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="$root.loading"
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
        <ants-table-column
          type="selection"
          width="45"
          align="center"
        ></ants-table-column>
        <ants-table-column
          prop="id"
          label="ID"
          width="60"
        > </ants-table-column>
        <ants-table-column
          prop="name"
          label="分组名称"
          min-width="130"
        >
        </ants-table-column>

        <ants-table-column
          label="NS 属性"
          min-width="150"
        >
          <template #default="{ row }">
            <div
              v-for="(item, idx) in JSON.parse(row.extraNsJson)"
              :key="idx"
            >
              <span class="text-ants-text-4">{{ idx }}：</span>
              <span>{{ item }}</span>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="extraSoaJson"
          label="SOA 属性"
          min-width="150"
        >
          <template #default="{ row }">
            <div
              v-for="(item, idx) in JSON.parse(row.extraSoaJson)"
              :key="idx"
            >
              <span class="text-ants-text-4">{{ idx }}：</span>
              <span>{{ item }}</span>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="remark"
          label="备注信息"
          min-width="120"
        />

        <ants-table-column
          prop="childNodeCount"
          label="节点数量"
          min-width="60"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              size="mini"
              type="primary"
            >
              {{ row.childNodeCount }}
            </el-tag>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="weight"
          label="排序"
          min-width="60"
          align="center"
        >
        </ants-table-column>

        <ants-table-column
          prop="status"
          label="启用"
          min-width="60"
        >
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#F52443"
              :ref="`tableSwitchRef${$index}`"
              @change="toggleStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>

        <ants-table-column
          label="操作"
          width="150"
          auto-fixed
        >
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              @click="toCreateUpdate(row)"
              text="修改"
            />
            <ants-button
              size="mini"
              type="danger"
              @click="toDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加 修改分组对话框 -->
    <FormDialog ref="FormDialogRef" />
  </div>
</template>

<script>
// API
import {
  getServerGroupList,
  doUpdateServerGroup
} from '@/v2/dns_admin/api/dns/serve'

import FormDialog from './FormDialog'

export default {
  components: {
    FormDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        key: '', // 搜索框内容
        pagenum: 1, // 当前的页数
        pagesize: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取服务列表数据
     */

    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getServerGroupList(this.queryInfo)

        this.$root.loading = false
        if (res.code !== 1) return
        this.total = res.data.totalCount || 0
        this.tableData = res.data.list || []
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    /**
     * @description: 添加-修改服务分组对话框显示
     * @param {*} row
     */

    toCreateUpdate(row = {}) {
      this.$refs.FormDialogRef.showDialog(row)
    },

    /**
     * @description: 启用-禁用
     * @param {*} row
     */

    async toggleStatus(row, switchRef) {
      let txt = '启用'
      if (row.status === 0) {
        const confirmResult = await this.$confirm(
          '此操作将会禁用服务分组：' + row.name + '，是否继续？',
          '禁用服务分组',
          {
            type: 'warning',
            center: true
          }
        ).catch((err) => err)
        if (confirmResult !== 'confirm') {
          row.status = 1
          return this.$msg.info('已取消操作')
        }
        txt = '禁用'
      }
      this.$refs[switchRef].loading = true

      const { data: res } = await doUpdateServerGroup(row)
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }
      this.getTableData()
      this.$msg.success(txt + '服务分组成功')
    },

    /**
     * @description: 单个删除分组
     * @param {*} row
     */

    async toDelete(row) {
      const result = await this.$doDelete({
        tag: '服务分组'
      })
      if (!result) return

      const { data: res } = await doUpdateServerGroup({
        id: row.id,
        isDelete: 1
      })

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除服务分组成功')
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      
    }
  }
}
</script>
