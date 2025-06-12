<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`添加${parentId ? '备用IP' : '主节点'}`"
    width="800px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
    class="node-tree-dialog"
  >
    <div class="flex items-center justify-between mb-lg -mt-sm">
      <ants-select
        v-if="parentId == 0"
        v-model="line"
        filterable
        size="small"
        placeholder="请选择DNS线路"
        :loading="lineLoading"
        style="max-width:250px;"
      >
        <ants-option
          v-for="(value, key) in lineObj"
          :key="key"
          :label="value"
          :value="key"
        />
      </ants-select>
      <ants-input
        class="ants-search_input"
        placeholder="检索节点"
        clearable
        v-model="filterIp"
        size="small"
        style="max-width:220px;"
      >
        <i slot="prefix" class="el-input__icon aicon icon-sousuo"></i>
      </ants-input>
    </div>

    <div
      class="flex items-center justify-between flex-1 font-bold text-ants-text-3 pb-df text-sm"
    >
      <div class="ml-xs">节点IP</div>
      <div class="flex items-center text-right">
        <div class="pl-sm truncate" style="width:140px;">主机区域</div>
        <div class="pl-sm truncate" style="width:140px;">线路</div>
        <div class="pl-sm pr-2 truncate" style="width:80px;">已使用</div>
      </div>
    </div>

    <el-tree
      :data="clientArr"
      show-checkbox
      node-key="id"
      :default-expand-all="false"
      :expand-on-click-node="true"
      :check-strictly="true"
      :highlight-current="false"
      ref="ipTreeRef"
      :filter-node-method="filterNode"
      :props="defaultProps"
    >
      <div
        class="flex items-center justify-between flex-1 py-xs text-sm"
        slot-scope="{ node, data }"
      >
        <span>{{ node.label }}</span>
        <div class="flex items-center text-right">
          <div class="pl-sm truncate" style="width:140px;">
            {{ data.area }}
          </div>
          <div class="pl-sm truncate" style="width:140px;">
            {{ data.line }}
          </div>
          <div class="pl-sm pr-2 truncate" style="width:80px;">
            {{ data.inGroupCount || 0 }} 次
          </div>
        </div>
      </div>
    </el-tree>
  </ants-dialog>
</template>

<script>
// API
import { doAddClientIds, getUnuesdClient } from '@/v2/cdn_admin/api/cdn/node'

export default {
  props: {
    // 线路列表
    lineObj: Object,
    lineLoading: Boolean,
    // 当前分组ID
    groupId: [String, Number]
  },
  data() {
    return {
      dialogVisible: false,
      // 选择节点的父id，添加主节点时 = 0
      parentId: 0,
      // DNS线路
      line: '',

      // 检索节点
      filterIp: '',
      // tree 配置项
      defaultProps: {
        children: 'childBackupIpList',
        label: 'clientIp',
        // status = 0，表示列表已添加过，不能选
        disabled: (data, node) => {
          return data.status === 0
        }
      },
      // 节点列表数据
      clientArr: []
    }
  },
  watch: {
    filterIp(val) {
      this.$refs.ipTreeRef.filter(val)
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.parentId = row.id || 0
      this.getUnuesdClientData()
    },

    /**
     * @description: 检索过滤节点
     */

    filterNode(value, data) {
      if (!value) return true
      return data.clientIp.indexOf(value) !== -1
    },

    /**
     * @description: 获取分组中未使用的节点
     */

    async getUnuesdClientData() {
      this.$refs.dialogRef.bodyLoading = true
      const { data: res } = await getUnuesdClient({
        // 当前分组ID
        groupId: this.groupId,
        // 选择节点的父id，添加主节点时 = 0
        parentId: this.parentId
      })
      this.$refs.dialogRef.bodyLoading = false
      if (res.code !== 1) return
      this.clientArr = res.data || []
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      if (!this.line && this.parentId == 0) return this.$msg.error('请选择DNS线路')
      // 当前选择节点的 id 数组
      const checkedIpArr = this.$refs.ipTreeRef.getCheckedKeys()
      if (!checkedIpArr.length) return this.$msg.warning('请选择节点')

      this.$refs.dialogRef.btnLoading = true
      const { data: res } = await doAddClientIds({
        // 当前分组id
        id: this.groupId,
        // 选择节点的父id，添加主节点时 = 0
        parentId: this.parentId,
        // 选中的节点ID
        ids: checkedIpArr + '',
        // DNS线路
        line: this.line
      })
      this.$refs.dialogRef.btnLoading = false
      if (!res) return
      this.dialogVisible = false
      this.$parent.getTableData()
    },

    // 表单重置
    resetForm() {
      this.line = ''
      this.clientArr = []
    }
  }
}
</script>

<style lang="scss">
.node-tree-dialog {
  .el-tree-node {
    border-top: 1px solid theme('colors.ants-border-3');
  }
  .el-tree-node:focus > .el-tree-node__content {
    background-color: rgba(255, 255, 255, 0);
  }
  .el-tree-node__content {
    height: 36px;
    &:hover {
      background-color: rgba(255, 255, 255, 0);
    }
  }
}
</style>
