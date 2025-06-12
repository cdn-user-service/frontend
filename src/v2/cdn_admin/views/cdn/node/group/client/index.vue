<template>
  <div class="content-box animated fadeIn">
    <ants-tab-card
      value-key="id"
      label-key="name"
      :tab-arr="groupList"
      :active="groupId"
      @change="changeCode"
    >
      <div class="flex items-center justify-between">
        <div>
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :disabled="$root.loading"
            text="添加主IP"
            @click="showCreateClientDialog()"
          />
          <ants-button
            icon="el-icon-delete"
            type="info"
            size="small"
            :loading="btnLoading"
            :disabled="$root.loading"
            @click="batchDelete"
            text="批量删除"
          />
        </div>
        <ants-button
          type="success"
          size="small"
          icon="el-icon-refresh"
          :loading="$root.loading"
          @click="getTableData()"
          text="刷新"
        />
      </div>

      <el-table
        :data="tableData"
        @selection-change="handleSelectionChange"
        row-key="id"
        v-loading="$root.loading"
        :tree-props="{ children: 'child', hasChildren: 'hasChildren' }"
      >
        <div slot="empty">
          <el-empty :description="antsT('暂无数据')"> </el-empty>
        </div>
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>
        <ants-table-column prop="clientIp" label="节点" min-width="140">
        </ants-table-column>
        <ants-table-column label="主/备" min-width="60">
          <template #default="{ row }">
            <el-tag size="mini" type="primary" v-if="row.parentId == 0"
              >主</el-tag
            >
            <el-tag size="mini" type="info" v-else>备</el-tag>
          </template>
        </ants-table-column>
        <ants-table-column
          label="CNAME"
          prop="cname"
          min-width="140"
        ></ants-table-column>
        <ants-table-column label="DNS线路" prop="line" min-width="100">
          <template #default="{ row }">
            <span
              v-loading="lineLoading"
              element-loading-spinner="el-icon-loading"
            >
              {{ lineObj[row.line] }}
            </span>
          </template>
        </ants-table-column>
        <ants-table-column
          label="TTL"
          prop="ttl"
          min-width="100"
        ></ants-table-column>

        <ants-table-column label="健康状态" min-width="80">
          <template #default="{ row }">
            <div v-if="typeof row.clientEntity === 'object'">
              <el-tag
                v-if="(row.clientEntity || {}).stableScore >= 10"
                size="mini"
                type="success"
                >正常</el-tag
              >
              <el-tag
                v-else-if="
                  (row.clientEntity || {}).stableScore > 0 &&
                    (row.clientEntity || {}).stableScore < 10
                "
                size="mini"
                type="warning"
                >在线</el-tag
              >
              <el-tag v-else size="mini" type="danger">故障</el-tag>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column prop="recordInfos" label="解析状态" min-width="100">
          <template #default="{ row }">
            <span class="text-success el-icon-success" v-if="row.recordInfos">
              解析中
            </span>
            <span v-else>-</span>
          </template>
        </ants-table-column>

        <el-table-column prop="status" label="启用解析" min-width="80">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-if="row.parentId == 0"
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </el-table-column>

        <ants-table-column label="操作" width="160" auto-fixed align="right">
          <template #default="{ row }">
            <span v-if="row.parentId == 0">
              <el-link
                type="success"
                :disabled="btnLoading"
                @click="showCreateClientDialog(row)"
                class="text-sm"
                :underline="false"
                >添加备IP</el-link
              >
              <el-divider direction="vertical"></el-divider>
              <el-link
                type="primary"
                :disabled="btnLoading"
                class="text-sm"
                :underline="false"
                @click="showUpdateClientDialog(row)"
                >修改</el-link
              >
              <el-divider direction="vertical"></el-divider>
            </span>

            <el-link
              type="danger"
              :disabled="btnLoading"
              class="text-sm"
              :underline="false"
              @click="singleDelete(row)"
              >删除</el-link
            >
          </template>
        </ants-table-column>
      </el-table>
    </ants-tab-card>

    <!-- 添加主节点对话框 -->
    <CreateDialog
      ref="CreateDialogRef"
      :line-obj="lineObj"
      :line-loading="lineLoading"
      :group-id="groupId"
    />

    <!-- 修改 DNS线路、ttl 对话框 -->
    <UpdateDialog
      ref="UpdateDialogRef"
      :line-obj="lineObj"
      :line-loading="lineLoading"
    />
  </div>
</template>

<script>
// API
import {
  getGroupList,
  getGroupDetailById,
  doDeleteClientIds,
  doUpdateClient
} from '@/v2/cdn_admin/api/cdn/node'

import { getlineList } from '@/v2/cdn_admin/api/cdn/dns'

import CreateDialog from './components/CreateDialog'
import UpdateDialog from './components/UpdateDialog'

export default {
  components: {
    CreateDialog,
    UpdateDialog
  },
  data() {
    return {
      queryInfo: {
        page: 1,
        limit: 20
      },
      // 当前选中分组ID
      groupId: +this.$route.query.id,
      // 当前选中分组数据
      groupItem: {},
      // 当前分组的 dnsConfigId
      dnsConfigId: null,
      // 分组列表
      groupList: [],
      // 节点列表
      tableData: [],
      selectArr: [],

      // 线路列表
      lineObj: {},
      lineLoading: false,
      btnLoading: false
    }
  },
  watch: {
    // 监听分组 dnsConfigId 改变
    dnsConfigId(val) {
      this.getlineListData(val)
    },

    // 监听params 切换当前选中分组ID
    '$route.query.id': function(newVal, oldVal) {
      this.groupId = +newVal
    }
  },
  created() {
    this.getGroupList()
  },
  methods: {
    /**
     * @description: 切换分组
     */

    changeCode(val) {
      this.groupId = +val
      this.$router.replace({ query: { id: val } })
      this.getTableData()
    },

    /**
     * @description: 获取分组列表
     */

    async getGroupList() {
      this.$root.loading = true
      const { data: res } = await getGroupList({
        page: 1,
        limit: 50
      })

      if (res.code !== 1) {
        this.$root.loading = false
        return
      }
      // 分组列表
      this.groupList = (res.data && res.data.list) || []

      // 获取表格数据
      this.getTableData()
    },

    /**
     * @description: 根据分组ID 获取表格节点数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getGroupDetailById({
        groupId: this.groupId
      })
      this.$root.loading = false
      if (res.code !== 1) return
      this.groupItem = res.data || {}
      this.dnsConfigId = res.data && res.data.dnsConfigId
      this.tableData = (res.data && res.data.clientInfos) || []
    },

    /**
     * @description: 获取线路列表
     */

    async getlineListData(dnsConfigId) {
      if (!dnsConfigId) return
      this.lineLoading = true
      const { data: res } = await getlineList({
        id: dnsConfigId
      })
      this.lineLoading = false
      if (res.code !== 1) return
      this.lineObj = res.data || []
    },

    // 多选
    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description: 点击添加主备IP
     */

    showCreateClientDialog(row = {}) {
      this.$refs.CreateDialogRef.showDialog(row)
    },

    /**
     * @description: 启动禁用解析
     */

    async changeStatus(row, switchRef) {
      if (row.status == 0) {
        const result = await this.$doDelete({
          title: '禁用解析',
          content: `此操作将禁用解析“ <strong style="color: #F78989;">${row.clientIp}</strong> ”，是否继续？`
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      const { id, line, ttl, status } = row
      const { data: res } = await doUpdateClient({
        id,
        line,
        ttl,
        status
      })
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }
      this.$msg.success('操作成功')
    },

    /**
     * @description: 修改节点 线路 ttl status
     */

    showUpdateClientDialog(row = {}) {
      this.$refs.UpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '节点'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      const { data: res } = await doDeleteClientIds({
        id: this.groupId,
        ids: idsArr + ''
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(selectLength + this.antsT('个节点已成功删除'))
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     */

    async singleDelete({ id }) {
      const result = await this.$doDelete({
        tag: '节点'
      })
      if (!result) return

      const { data } = await doDeleteClientIds({
        id: this.groupId,
        ids: id
      })
      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
    }
  }
}
</script>

<style lang="scss">
.el-loading-spinner {
  margin-top: -11px;
}
</style>
