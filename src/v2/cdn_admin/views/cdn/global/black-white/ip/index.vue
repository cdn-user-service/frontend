<template>
  <div class="animated fadeIn">
    <table-query-form
      :search-arr="[
        {
          name: '检索分组',
          key: 'ip',
          value: queryInfo.ip
        }
      ]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          type="success"
          size="small"
          icon="el-icon-s-promotion"
          :disabled="$root.loading"
          :loading="btnLoading"
          text="同步数据"
          @click="getRemoteData()"
        />
        <ants-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          :disabled="$root.loading"
          text="添加分组"
          @click="
            showCreateUpdateDialog({
              control: queryInfo.control
            })
          "
        />
      </template>
    </table-query-form>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      @selection-change="handleSelectionChange"
      :total="total"
      :queryInfo="queryInfo"
      row-key="id"
      :tree-props="{ children: 'child', hasChildren: 'hasChildren' }"
    >
      <ants-table-column prop="id" label="ID" width="120"> </ants-table-column>
       <ants-table-column label="数据来源" min-width="80">
        <template #default="{ row }">
          <el-tag type="success" size="small" v-if="row.ipSource == 1">云端数据</el-tag>
          <el-tag type="primary" size="small" v-if="row.ipSource == 0">自定义</el-tag>
        </template>
      </ants-table-column>

      <ants-table-column prop="remark" label="分组名称" min-width="140">
      </ants-table-column>

      <ants-table-column label="类型" min-width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="controlObj[+row.control].type">{{
            controlObj[+row.control].name
          }}</el-tag>
        </template>
      </ants-table-column>

      <!-- <ants-table-column prop="status" label="IP数" min-width="60">
        <template #default="{ row }">
          <el-tag size="small" type="primary">{{ row.childCount || 0 }}</el-tag>
        </template>
      </ants-table-column> -->

      <ants-table-column prop="createTime" label="更新时间" min-width="140">
      </ants-table-column>

      <ants-table-column prop="status" label="状态" min-width="60">
        <template #default="{ row, $index }">
          <ants-table-switch
            v-model="row.status"
            :ref="`tableSwitchRef${$index}`"
            @change="changeStatus(row, `tableSwitchRef${$index}`)"
          />
        </template>
      </ants-table-column>

      <ants-table-column label="操作" width="210" auto-fixed>
        <template #default="{ row }">
          <template v-if="row.ipSource == 1">
            <ants-button
              size="mini"
              type="success"
              :disabled="btnLoading"
              @click="showIpDefaultDialog(row)"
              text="查看"
            />
            <ants-button
              size="mini"
              type="success"
              :disabled="btnLoading"
              text="同步"
              @click="getRemoteData(row.id)"
            />
            <ants-button size="mini" type="info" disabled text="删除" />
          </template>

          <template v-else>
            <ants-button
              size="mini"
              type="success"
              :disabled="btnLoading"
              @click="showAdminDialog(row)"
              text="管理"
            />
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
        </template>
      </ants-table-column>
    </ants-table>

    <!-- 添加修改分组对话框 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" />

    <!-- IP管理对话框 -->
    <IpAdminDialog :control-obj="controlObj" ref="IpAdminDialogRef" />

    <!-- 默认IP列表对话框 -->
    <IpDefaultDialog :control-obj="controlObj" ref="IpDefaultDialogRef" />
  </div>
</template>

<script>
// API
import {
  syncAntsIpData,
  getIpControlList,
  doSaveIpOrControl,
  doBatchDeleteIpOrControl
} from '@/v2/cdn_admin/api/cdn/ip'

import CreateUpdateDialog from './components/CreateUpdateDialog'
import IpAdminDialog from './components/IpAdminDialog'
import IpDefaultDialog from './components/IpDefaultDialog'

const controlObj = {
  '-1': {
    name: '所有',
    type: 'primary'
  },
  0: {
    name: '未定义',
    type: 'warning'
  },
  1: {
    name: '永久白名单',
    type: 'success'
  },
  4: {
    name: '永久黑名单',
    type: 'info'
  }
}

export default {
  components: {
    CreateUpdateDialog,
    IpAdminDialog,
    IpDefaultDialog
  },
  data() {
    return {
      controlObj,
      total: 0,
      queryInfo: {
        parentId: 0,
        // 分组类型： -1 = 所有, 0 = 未定义, 1 = 白名单（7层）, 2 = 7层黑名单, 3 = 3层黑名单
        control: +this.$route.query.type || 1,
        ip: '',
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],
      selectArr: [],
      btnLoading: false
    }
  },
  computed: {},
  watch: {
    '$route.query.type': function(newVal, oldVal) {
      this.queryInfo.control = +newVal || 1
      this.queryInfo.page = 1
      this.queryInfo.ip = ''
      this.total = 0
      this.tableData = []
      this.getTableData()
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 同步远程数据
     */

    async getRemoteData(id = 0) {
      this.btnLoading = true
      const { data: res } = await syncAntsIpData({
        // 为空或为零则同步所有
        id
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.$msg.success('同步数据成功')
      this.getTableData()
    },

    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getIpControlList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      this.tableData = obj.list || []
      this.total = obj.totalCount || 0
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: IP管理对话框显示
     */

    showAdminDialog(row = {}) {
      this.$refs.IpAdminDialogRef.showDialog(row)
    },

    /**
     * @description: 默认IP对话框展示
     */

    showIpDefaultDialog(row = {}) {
      this.$refs.IpDefaultDialogRef.showDialog(row)
    },

    /**
     * @description: 添加修改对话框展示
     * @param {*} row
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 切换状态
     * @param {*} row
     * @param {*} switchRef
     */

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用分组',
          content: `此操作将禁用分组“ <strong class="text-error">${row.remark}</strong> ”，是否继续？`
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      const { data: res } = await doSaveIpOrControl(row)
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

    async batchDelete() {},

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete({ id }) {
      const result = await this.$doDelete({
        tag: '分组'
      })
      if (!result) return
      this.btnLoading = true
      const { data: res } = await doBatchDeleteIpOrControl({
        ids: id
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除分组成功'))
    }
  }
}
</script>
