<template>
  <el-popover
    placement="bottom"
    width="260"
    trigger="click"
    @show="showPopover"
    v-model="popoverShow"
  >
    <div style="height:400px;" class="relative" v-loading="loading">
      <div class="overflow-y-auto" style="max-height:350px;">
        <div
          class="font-bold text-center pb-sm mb-lg pt-xxs border-b border-ants-border-4 text-ants-text-1"
        >
          请选择要添加的节点
        </div>
        <el-empty
          description="暂无数据"
          v-if="clientArr.length === 0"
          style="transform: scale(0.8)"
        ></el-empty>

        <ants-radio-group v-model="client" v-else class="space-y-6 px-df">
          <ants-radio
            v-for="item in clientArr"
            :key="item.id"
            :label="item.id"
            class="block"
            :text="item.clientIp"
            />
        </ants-radio-group>
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

      // 选中的节点
      client: null,
      // 节点列表数据
      clientArr: []
    }
  },
  computed: {},
  created() {},
  methods: {
    async getUnuesdClientData() {
      this.loading = true
      const { data: res } = await getUnuesdClient({
        groupId: this.groupId
      })
      this.loading = false
      if (res.code !== 1) return
      this.clientArr = res.data || []
    },

    showPopover() {
      this.getUnuesdClientData()
    },

    /**
     * @description: 提交
     */

    async submitAddClient() {
      if (!this.client) return this.$msg.error('请选择节点！')
      this.btnLoading = true
      const { data } = await doAddClientIds({
        id: this.groupId,
        ids: this.client + ''
      })
      this.btnLoading = false

      if (data.code !== 1) return
      this.emit('getGroupItem')
      this.$msg.success('添加节点成功')
      this.hidePopover()
    },

    // 隐藏 dropdown
    hidePopover() {
      this.popoverShow = false
    },

    searchDomain() {}
  }
}
</script>
