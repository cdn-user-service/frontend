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
            :disabled="$root.loading"
            @click="toSave()"
            text="添加业务分组"
          />

          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            :disabled="$root.loading"
            @click="toBulkDel"
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

        <ants-table-column width="70" prop="id" label="ID"> </ants-table-column>
        <ants-table-column prop="name" label="分组名称" min-width="140">
        </ants-table-column>

        <ants-table-column prop="hash" label="HASH" min-width="140">
        </ants-table-column>

        <ants-table-column label="CNAME" min-width="200">
          <template #default="{ row }">
            <ants-copy :text="row.cname || ''" />
          </template>
        </ants-table-column>

        <ants-table-column prop="gropuInfo" label="节点分组" min-width="100">
          <template #default="{ row }">
            <span>{{ row.areaName || '' }}</span>
          </template>
        </ants-table-column>

        <ants-table-column label="节点数" min-width="80" prop="clientIds">
          <template #default="{ row }">
            <el-tag size="small">{{ row.clientIds || 0 }}</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="状态" min-width="70">
          <template #default="{ row }">
            <span class="el-icon-success text-success" v-if="row.status === 1">
              正常</span
            >
            <span v-else class="el-icon-remove text-error"> 异常</span>
          </template>
        </ants-table-column>

        <ants-table-column prop="weight" label="排序" min-width="70">
        </ants-table-column>

        <ants-table-column prop="recordMode" label="调度方式" width="140">
          <template #default="{ row }">
            {{ row.recordMode == 1 ? 'GTM调度(DNS系统)' : 'CDN系统调度' }}
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="210" auto-fixed>
          <template #default="{ row }">
            <ants-button
              :type="row.recordMode == 1 ? 'info' : 'success'"
              :disabled="row.recordMode == 1"
              size="mini"
              @click="toClient(row)"
              text="节点"
            />

            <ants-button
              type="primary"
              size="mini"
              :disabled="btnLoading"
              @click="toSave(row)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              :disabled="btnLoading"
              @click="toDel(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加业务分组对话框 -->
    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      @refresh="getTableData"
      :groupList="groupList"
    />
  </div>
</template>

<script>
// API
import {
  getGroupList,
  doDeleteGroup,
  getNodeGroup
} from '@/v2/cdn_admin/api/cdn/node'
// 组件
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
        key: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: [],

      // 节点分组列表
      groupList: []
    }
  },
  created() {
    this.getTableData()
    this.getNodeGroupList()
  },
  methods: {
    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getGroupList(this.queryInfo)
        if (res.code !== 1) return
        const { list = [], totalCount = 0 } = res.data || {}
        this.tableData = list
        this.total = totalCount
      } catch (error) {
        console.error('获取表格数据失败:', error)
      } finally {
        this.$root.loading = false
      }
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 获取节点分组列表
    async getNodeGroupList() {
      const { data: res } = await getNodeGroup({
        page: 1,
        limit: 500
      })
      if (res.code !== 1) return
      const { list = [] } = res.data || {}
      this.groupList = list
    },

    // 管理节点
    toClient({ id }) {
      this.$router.push({ path: './group/client', query: { id } })
    },

    // 添加-修改业务分组
    toSave(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    // 批量删除
    async toBulkDel() {
      const selectLength = this.selectArr.length
      const result = await this.$toBulkDel(selectLength, {
        tag: '业务分组'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const idsArr = this.selectArr.map((item, index) => {
          return item.id
        })
        const { data: res } = await doDeleteGroup({
          ids: idsArr + ''
        })

        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(
          this.antsT(res.success + '个分组删除成功，' + res.fail + '个删除失败')
        )
        this.selectArr = [] // 释放
      } catch (error) {
        console.error('批量删除失败:', error)
      } finally {
        this.btnLoading = false
      }
    },

    // 单个删除
    async toDel({ id }) {
      const result = await this.$doDelete({
        tag: '业务分组'
      })
      if (!result) return
      this.btnLoading = true
      try {
        const { data } = await doDeleteGroup({
          ids: id
        })

        if (data.code !== 1) return
        this.getTableData()
        this.$msg.success(this.antsT('删除业务分组成功'))
      } catch (error) {
        console.error('单个删除失败:', error)
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>
