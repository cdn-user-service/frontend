<template>
  <el-popover
    placement="top"
    trigger="click"
    v-model="visible"
    @show="popoverShow"
  >
    <el-date-picker
      v-model="endTime"
      type="datetime"
      placeholder="请选择到期时间"
      size="small"
      value-format="yyyy-MM-dd HH:mm:ss"
    >
    </el-date-picker>

    <div class="mt-lg text-center">
      <ants-button
        type="info"
        size="mini"
        text="取消"
        @click="visible = false"
      />
      <ants-button
        type="primary"
        size="mini"
        text="确定"
        :loading="loading"
        @click="submitUpdate"
      />
    </div>

    <span
      slot="reference"
      class="el-icon-edit-outline cursor-pointer text-primary text-2xl"
    ></span>
  </el-popover>
</template>

<script>
import { doUpdateSoldPlanAttr } from '@/v2/cdn_admin/api/cdn/product'

export default {
  props: {
    rowData: Object
  },
  data() {
    return {
      visible: false,
      loading: false,
      endTime: ''
    }
  },
  methods: {
    popoverShow() {
      this.loading = false
      this.endTime = this.rowData.endTime
    },

    async submitUpdate() {
      if (!this.endTime) return this.$msg.error('请选择到期时间')
      this.loading = true

      const { data: res } = await doUpdateSoldPlanAttr({
        serialNumber: this.rowData.serialNumber,
        id: this.rowData.id,
        endTime: this.endTime
      })

      if (res.code !== 1) return
      this.loading = false
      this.visible = false
      this.$msg.success('修改成功')
      this.$emit('refreshData')
    }
  }
}
</script>
