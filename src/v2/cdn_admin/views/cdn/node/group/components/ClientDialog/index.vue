<template>
  <div class="client-dialog-box">
    <ants-dialog
      v-model="dialogVisible"
      ref="dialogRef"
      :title="`管理节点 【${groupItem.name}】`"
      width="1200px"
      top="5vh"
      @close="resetForm"
      @submit="submitForm"
    >
      <div class="mb-df -mt-df flex justify-between">
        <div>
          <CreatePopover
            :group-id="groupItem.id"
            @getGroupItem="getGroupItem"
            ref="CreatePopoverRef"
            class="mr-sm"
          />

          <el-button
            size="mini"
            icon="el-icon-delete"
            type="info"
            :loading="btnLoading"
            @click="batchDelete"
            >{{ antsT('批量删除') }}</el-button
          >
        </div>
        <el-button
          size="mini"
          icon="el-icon-refresh"
          type="success"
          :disabled="btnLoading"
          @click="getGroupItem"
          >{{ antsT('刷新') }}</el-button
        >
      </div>

      <el-table
        :data="groupItem.clientInfos"
        @selection-change="handleSelectionChange"
        style="margin:0"
      >
        <div slot="empty">
          <el-empty :description="antsT('暂无数据')"> </el-empty>
        </div>
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>
        <ants-table-column label="节点" prop="clientIp" min-width="140">
        </ants-table-column>
        <ants-table-column label="主用/备用" prop="clientIp" min-width="100">
          <template #default="{ $index }">
            <el-tag size="mini" type="success" v-if="$index == 0">主用</el-tag>
            <el-tag size="mini" type="info" v-else>备用</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column label="线路" prop="line" min-width="140">
          <template #default="{ row }">
            <div v-if="row.line">
              <ants-select
                v-if="row.id === nowUpdateLineId"
                v-model="form.line"
                filterable
                size="mini"
                placeholder="请选择线路"
                :loading="lineLoading"
                v-loading="btnLoading"
                element-loading-spinner="el-icon-loading"
              >
                
                <ants-option
                  v-for="(value, key) in lineList"
                  :key="key"
                  :label="value"
                  :value="key"
                />
              </ants-select>

              <span v-else>{{ row.line }} </span>
            </div>
            <span v-else>-</span>
          </template>
        </ants-table-column>

        <ants-table-column label="TTL" prop="ttl" min-width="140">
          <template #default="{ row }">
            <div v-if="row.ttl">
              <ants-input-number
                v-if="row.id === nowUpdateLineId"
                size="mini"
                v-model="form.ttl"
                :step="1"
                :min="1"
                :precision="0"
                placeholder="TTL"
                v-loading="btnLoading"
                element-loading-spinner="el-icon-loading"
              ></ants-input-number>

              <span v-else>{{ row.ttl }} </span>
            </div>
            <span v-else>-</span>
          </template>
        </ants-table-column>

        <el-table-column prop="status" label="启用解析" width="80">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </el-table-column>

        <ants-table-column label="操作" width="160" align="right">
          <template #default="{ row, $index }">
            <div v-if="row.id === nowUpdateLineId">
              <ants-button
                :disabled="btnLoading"
                size="mini"
                type="primary"
                @click="submitUpdate(row)"
                text="确定"
                />
              <ants-button
                size="mini"
                type="info"
                @click="nowUpdateLineId = null"
                text="取消"
                />
            </div>
            <div v-else>
              <span
                v-if="row.line"
                class="cursor-pointer text-primary"
                @click="showUpdateRow(row)"
                >{{ antsT('修改') }}</span
              >
              <el-divider direction="vertical" v-if="row.line"></el-divider>
              <!-- 第一项默认为主用 -->
              <span
                class="cursor-not-allowed text-ants-text-4"
                v-if="$index == 0"
                >主用</span
              >
              <span
                v-else
                class="cursor-pointer text-success"
                @click="setMain(row)"
                >{{ antsT('主用') }}</span
              >
              <el-divider direction="vertical"></el-divider>
              <span
                class="text-error cursor-pointer"
                @click="singleDelete(row)"
                >{{ antsT('删除') }}</span
              >
            </div>
          </template>
        </ants-table-column>
      </el-table>
    </ants-dialog>
  </div>
</template>

<script>
// api
import {
  doDeleteClientIds,
  doUpdateClient,
  getGroupDetailById,
  setFirstClient
} from '@/v2/cdn_admin/api/cdn/node'

import { getlineList } from '@/v2/cdn_admin/api/cdn/dns'

import CreatePopover from './components/CreatePopover'

const defaultForm = {
  // dns配置ID
  dnsConfigId: '',
  name: ''
}
export default {
  components: {
    CreatePopover
  },
  data() {
    return {
      dialogVisible: false,
      name: '业务分组',
      groupItem: {
        id: null,
        name: '业务分组',
        clientInfos: []
      },
      selectArr: [],
      btnLoading: false,

      lineLoading: false,
      // 线路列表
      lineList: [],
      // 修改线路
      line: '',
      // 修改线路select 是否显示
      nowUpdateLineId: null,
      form: {
        line: '',
        ttl: null
      }
    }
  },
  
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row) {
      this.dialogVisible = true
      this.groupItem = {
        ...row
      }
      this.getGroupItem()
      this.getlineListData()
    },

    /**
     * @description: 获取表格数据
     */

    async getGroupItem() {
      this.$refs.dialogRef.bodyLoading = true
      const { data: res } = await getGroupDetailById({
        groupId: this.groupItem.id
      })
      this.$refs.dialogRef.bodyLoading = false

      if (res.code !== 1) return
      this.groupItem = res.data || {}
    },

    /**
     * @description: 获取线路列表
     */

    async getlineListData() {
      this.lineLoading = true
      const { data: res } = await getlineList({
        id: this.groupItem.dnsConfigId
      })
      this.lineLoading = false

      if (res.code !== 1) return
      this.lineList = res.data || []
    },

    // 修改线路显示
    showUpdateRow(row) {
      this.nowUpdateLineId = row.id
      this.form.line = row.line
      this.form.ttl = row.ttl
    },

    /**
     * @description: 修改线路提交
     * @param {*} row
     */

    async submitUpdate(row) {
      if (!this.form.line) return this.$msg.warning('请选择线路！')
      if (!this.form.ttl) return this.$msg.warning('请输入TTL')
      this.btnLoading = true

      const { data } = await doUpdateClient({
        // 当前分组ID
        groupId: row.groupId,
        // 当前行节点ID
        clientId: row.clientId,
        // 线路
        line: this.form.line,
        // TTL
        ttl: this.form.ttl
      })
      this.btnLoading = false
      if (data.code !== 1) return
      this.nowUpdateLineId = null
      this.getGroupItem()
      this.$msg.success('修改成功')
    },

    /**
     * @description: 添加提交
     */

    async submitForm() {
      this.dialogVisible = false
    },

    // 多选
    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description: 设置主用
     */

    async setMain({ id }) {
      const { data: res } = await setFirstClient({
        groupId: this.groupItem.id,
        clientId: id
      })
      if (res.code !== 1) return
      this.getGroupItem()
      this.$msg.success('操作成功')
    },

    /**
     * @description: 启动禁用节点
     * @param {*} row
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
      const { data: res } = await doUpdateClient({
        // 当前分组ID
        groupId: row.groupId,
        // 当前行节点ID
        clientId: row.clientId,
        // 启用状态
        status: row.status
      })
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
        tag: '节点'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      const { data: res } = await doDeleteClientIds({
        id: this.groupItem.id,
        ids: idsArr + ''
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.getGroupItem()
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
        id: this.groupItem.id,
        ids: id
      })
      if (data.code !== 1) return
      this.getGroupItem()
      this.$msg.success(this.antsT('删除成功'))
    },

    // 添加DNS表单重置
    resetForm() {
      // this.$parent.getTableData()
      //   this.form = defaultForm
      //   this.$refs.formRef.resetFields()
    },

    // 添加节点表单重置
    resetAddForm() {
      this.nowUpdateLineId = null
      this.lineList = []
      this.form.client = []
      this.$refs.formRef.resetFields()
    }
  }
}
</script>

<style lang="scss">
.client-dialog-box {
  .el-loading-spinner {
    margin-top: 0px;
  }
}
</style>
