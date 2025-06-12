<template>
  <el-popover
    placement="bottom-start"
    width="500"
    trigger="click"
    @show="showPopover"
    v-model="popoverShow"
  >
    <div style="height:500px;" class="relative" v-loading="loading">
      <div class="font-bold text-center pb-df pt-xxs text-ants-text-1">
        请选择要添加的节点
      </div>

      <div>
        <ants-input
          class="ants-search_input mb-lg"
          placeholder="检索节点"
          clearable
          v-model="filterIp"
          size="small"
          style="width:100%;"
        >
          <i slot="prefix" class="el-input__icon aicon icon-sousuo"></i>
        </ants-input>

        <div
          class="flex items-center justify-between flex-1 font-bold text-ants-text-3 pb-df text-sm"
        >
          <span class="ml-xs">节点IP</span>
          <div class="flex items-center text-right ">
            <div class="pl-sm truncate" style="width:120px;">主机区域</div>
            <div class="pl-sm truncate" style="width:120px;">线路</div>
            <div class="pl-sm pr-2 truncate" style="width:60px;">已使用</div>
          </div>
        </div>

        <el-scrollbar class="tree-scrollbar-box" style="height:340px;width:100%;">
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
                <div class="pl-sm truncate" style="width:120px;">
                  {{ data.area }}
                </div>
                <div class="pl-sm truncate" style="width:120px;">
                  {{ data.line }}
                </div>
                <div class="pl-sm pr-2 truncate" style="width:60px;">
                  {{ data.inGroupCount || 0}} 次
                </div>
              </div>
            </div>
          </el-tree>
        </el-scrollbar>
      </div>

      <div
        class="absolute bottom-0 left-0 right-0 
          text-center pt-sm border-t 
          bg-ants-bg-1 border-ants-border-4"
      >
        <el-button size="mini" type="info" @click="hidePopover"
          >取 消</el-button
        >
        <el-button
          size="mini"
          type="primary"
          @click="submitAddClient"
          :loading="btnLoading"
          >确 定</el-button
        >
      </div>
    </div>
    <el-button slot="reference" type="primary" size="mini" icon="el-icon-plus"
      >添加节点</el-button
    >
  </el-popover>
</template>
<script>
// api
import { doAddClientIds, getUnuesdClient } from '@/v2/cdn_admin/api/cdn/node'

export default {
  props: {
    // 当前分组ID
    groupId: [String, Number]
  },
  data() {
    return {
      popoverShow: false,
      loading: false,
      btnLoading: false,

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
  computed: {},
  created() {},
  methods: {
    /**
     * @description: 检索过滤节点
     * @param {*} value
     * @param {*} data
     */

    filterNode(value, data) {
      if (!value) return true
      return data.clientIp.indexOf(value) !== -1
    },

    /**
     * @description: 获取节点数据
     */

    async getUnuesdClientData() {
      this.loading = true
      const { data: res } = await getUnuesdClient({
        groupId: this.groupId
      })
      this.loading = false
      if (res.code !== 1) return

      this.clientArr = res.data || []
    },

    // popover显示
    showPopover() {
      this.getUnuesdClientData()
    },

    /**
     * @description: 提交
     */

    async submitAddClient() {
      // 当前选择节点的 id 数组
      const checkedIpArr = this.$refs.ipTreeRef.getCheckedKeys()
      console.log(checkedIpArr)
      if (!checkedIpArr.length) return this.$msg.warning('请选择节点！')
      this.btnLoading = true
      const { data } = await doAddClientIds({
        id: this.groupId,
        ids: checkedIpArr + ''
      })
      this.btnLoading = false

      if (data.code !== 1) return
      this.$emit('getGroupItem')
      this.$msg.success('添加节点成功')
      this.hidePopover()
    },

    // 隐藏 dropdown
    hidePopover() {
      this.clientArr = []
      this.btnLoading = false
      this.popoverShow = false
    }
  }
}
</script>

<style lang="scss">
.tree-scrollbar-box {
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .el-tree-node {
    border-top: 1px solid theme('colors.ants-border-4');
  }
  .el-tree-node:focus>.el-tree-node__content {
    background-color: rgba(255,255,255,0);
  }
  .el-tree-node__content {
    height: 36px;
    &:hover {
      background-color: rgba(255,255,255,0);
    }
  }
}
</style>
