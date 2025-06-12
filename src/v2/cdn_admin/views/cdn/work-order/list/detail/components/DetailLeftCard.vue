<template>
  <el-card class="mb-lg">
    <ul>
      <li class="border-b border-ants-border-4 pb-lg">
        <TitleBorder :title="orderData.title"/>
        <div class="text-sm text-ants-text-4 mt-sm">
          提交时间：{{ orderData.createdate }}
        </div>
      </li>
      <li
        class="flex justify-between items-center py-lg border-b border-ants-border-4"
      >
        <span class="mr-lg">工单编号</span
        ><span class="text-sm">{{ orderData.id }}</span>
      </li>
      <li
        class="flex justify-between items-center py-lg border-b border-ants-border-4"
      >
        <span class="mr-lg">相关产品</span
        ><span class="one_show-h text-sm">{{ orderData.categoryObj && orderData.categoryObj.title }}</span>
      </li>
      <li
        class="flex justify-between items-center py-lg border-b border-ants-border-4"
      >
        <span class="mr-lg">紧急程度</span>
        <el-tag
          size="mini"
          :type="orderData.urgentLevel > 2 ? 'danger' : 'primary'"
        >
          {{ urgencyObj[+orderData.urgentLevel] }}
        </el-tag>
      </li>
      <li
        class="flex justify-between items-center py-lg border-ants-border-4"
      >
        <span class="mr-lg">当前状态</span>
        <span
          class="text-sm"
          :class="[orderStatusObj[`status_${orderData.status}`].icon]"
          :style="{ color: orderStatusObj[`status_${orderData.status}`].color }"
        >
          {{ orderStatusObj[`status_${orderData.status}`].txt }}</span
        >
      </li>

      <li class="py-lg">
        <!-- <el-button
          size="small"
          type="info"
          :disabled="orderData.status == 3"
          @click="showCloseOrderDialog"
          >驳 回</el-button
        > -->
        <!-- <ants-button
          size="small"
          :type="orderData.status == 3 ? 'success' : 'primary'"
          :disabled="orderData.status == 3"
          @click="showCloseOrderDialog"
          :text="orderData.status == 3 ? '已结单' : '结单'"
         /> -->
        <!-- <el-button size="small" type="info" 
        :disabled="orderData.suggestion_content"
        @click="showComplainDialog"
          >{{orderData.suggestion_content ? '已投诉' : '投诉'}}</el-button
        > -->
      </li>
    </ul>
  </el-card>
</template>

<script>
// 紧急程度
const urgencyObj = {
  1: '普通咨询',
  2: '操作体验问题',
  3: '业务/系统异常影响问题',
  4: '业务完全不可用'
}
export default {
  props: {
    workOrderData: {
      type: Object,
      default: () => ({
        title: '',
        urgency: null,
        category_id: null,
        order_number: null,
        status: 0,
        suggestion_content: null
      })
    }
  },
  computed: {
    orderData() {
      return this.workOrderData
    }
  },
  data() {
    return {
      // 紧急情况
      urgencyObj,
      orderStatusObj: Object.freeze({
        status_0: {
          txt: '处理中',
          color: '#E6A23C',
          icon: 'el-icon-warning'
        },
        status_1: {
          txt: '处理完成',
          color: '#999',
          icon: 'el-icon-remove'
        },
        status_2: {
          txt: '申诉处理中',
          color: '#ff6666',
          icon: 'el-icon-error'
        },
        status_3: {
          txt: '已结单',
          color: '#03B341',
          icon: 'el-icon-success'
        }
      })
    }
  },
  methods: {
    showCloseOrderDialog() {
      this.$msg.error('该功能暂未开启')
    },
    showComplainDialog() {
      this.$emit('showComplainDialog')
    }
  }
}
</script>
