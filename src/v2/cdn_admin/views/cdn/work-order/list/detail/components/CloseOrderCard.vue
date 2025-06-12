<template>
  <el-card class="mb-lg">
    <div class="font-bold" slot="header">结单反馈</div>
    <ul>
      <li class="flex items-center">
        <span class="mr-lg text-ants-text-4">整体评价</span>
        <el-rate v-model="orderData.score" show-text> </el-rate>
      </li>
      <li class="flex items-center my-lg">
          <span class="mr-lg text-ants-text-4">是否解决</span>
          <span class="text-error el-icon-error" v-if="orderData.solved != 1"> 未解决</span>
          <span class="text-success el-icon-success" v-else> 已解决</span>
      </li >

      <li class="flex">
          <div class="mr-lg text-ants-text-4">反馈内容</div>
          <div class="text-sm p-xs rounded-2xl bg-ants-bg-2 flex-1">
              {{orderData.feedback}}
          </div>
      </li>
    </ul>
  </el-card>
</template>

<script>
export default {
  props: {
    workOrderData: {
      type: Object,
      default: () => ({
        score: null,
        solved: 1,
        feedback: ''
      })
    }
  },
  computed: {
    orderData() {
      return this.workOrderData
    }
  },
  data() {
    return {}
  }
}
</script>
