<template>
  <el-popover
    placement="bottom"
    width="260"
    trigger="click"
    @show="showPopover"
    v-model="popoverShow"
  >
    <div class="p-lg">
      <ants-select
        v-model="line"
        filterable
        placeholder="请选择线路"
        :loading="lineLoading"
        @change="changeLine"
      >
        <ants-option
          v-for="(value, key) in lineList"
          :key="key"
          :label="value"
          :value="key"
        />
      </ants-select>
    </div>
    <div slot="reference">
      <slot></slot>
    </div>
  </el-popover>
</template>
<script>
// api
import { doUpdateClient } from '@/v2/cdn_admin/api/cdn/node'

export default {
  props: {
    // 线路值
    value: [String, Number],
    // 当前分组ID
    groupId: [String, Number],
    // 当前节点ID
    clientId: [String, Number],
    // 线路列表
    lineList: [Array, Object],
    // 加载中
    lineLoading: Boolean
  },
  model: {
    event: 'updateValue'
  },
  computed: {
    line: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('updateValue', val)
      }
    }
  },
  data() {
    return {
      popoverShow: false,
      btnLoading: false
    }
  },
  created() {},
  methods: {
    async changeLine(val) {
      if (!this.line) return this.$msg.warning('请选择线路！')
      this.btnLoading = true
      const { data } = await doUpdateClient({
        // 当前分组ID
        groupId: this.groupId,
        // 当前行节点ID
        clientId: this.clientId,
        // 线路
        line: val
      })
      this.btnLoading = false

      if (data.code !== 1) return
      this.$emit('getGroupItem')
      this.$msg.success('修改线路成功')
      this.hidePopover()
    },

    // popover显示
    showPopover() {
    },

    // 隐藏 dropdown
    hidePopover() {
      this.popoverShow = false
    }
  }
}
</script>
