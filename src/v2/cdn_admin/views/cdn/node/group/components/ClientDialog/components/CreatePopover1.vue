<template>
  <el-popover
    placement="bottom-start"
    width="260"
    trigger="click"
    @show="showPopover"
    v-model="popoverShow"
  >
    <div style="height:400px;" class="relative" v-loading="loading">
      <div class="font-bold text-center pb-df pt-xxs text-ants-text-1">
        请选择要添加的节点
      </div>
      <div
        class="flex items-center justify-between pb-sm border-b border-ants-border-4"
      >
        <ants-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="changeCheckAll"
          text="全选"
          />
        <span class="text-sm">
          <strong>{{ checkClient.length }}</strong> /
          {{ clientArr.length }}
        </span>
      </div>
      <div class="overflow-y-auto pb-sm" style="max-height:310px;">
        <el-empty
          description="暂无数据"
          v-if="clientArr.length === 0"
          style="transform: scale(0.8)"
        ></el-empty>
        <ants-checkbox-group
          v-else
          v-model="checkClient"
          @change="changeCheckClient"
          class="py-sm space-y-6"
        >
          <ants-checkbox
            v-for="item in clientArr"
            :label="item.id"
            :key="item.id"
            class="block"
            :text="item.clientIp"
            />
        </ants-checkbox-group>
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

      // 节点列表数据
      clientArr: [],
      // 用于全选的 client Id 数组
      clientArrIds: [],
      // 是否全选
      checkAll: false,
      // 是否半选
      isIndeterminate: false,
      // 选中节点
      checkClient: []
    }
  },
  computed: {},
  created() {},
  methods: {
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
      this.clientArrIds = this.clientArr.map(item => item.id)
    },

    // popover显示
    showPopover() {
      this.getUnuesdClientData()
    },

    // 点击全选
    changeCheckAll(checked) {
      this.checkClient = checked ? this.clientArrIds : []
      this.isIndeterminate = false
    },

    // 勾选
    changeCheckClient(val) {
      const checkedCount = val.length
      const total = this.clientArr.length
      this.checkAll = checkedCount === total
      this.isIndeterminate = checkedCount > 0 && checkedCount < total
    },

    /**
     * @description: 提交
     */

    async submitAddClient() {
      if (!this.checkClient.length) return this.$msg.warning('请选择节点！')
      this.btnLoading = true
      const { data } = await doAddClientIds({
        id: this.groupId,
        ids: this.checkClient + ''
      })
      this.btnLoading = false

      if (data.code !== 1) return
      this.$emit('getGroupItem')
      this.$msg.success('添加节点成功')
      this.hidePopover()
    },

    // 隐藏 dropdown
    hidePopover() {
      this.clientArr = this.clientArrIds = this.checkClient = []
      this.btnLoading = this.checkAll = this.isIndeterminate = false
      this.popoverShow = false
    },

    searchClient() {}
  }
}
</script>
