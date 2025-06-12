<template>
  <div
    class="flex justify-between items-center"
    :class="{ 'phone-top': isPhoneTop }"
  >
    <!-- 操作按钮 start-->
    <div>
      <slot name="buttons"></slot>
    </div>
    <!-- 操作按钮 end-->

    <!-- 检索输入框 start -->
    <div>
      <slot name="inputs"></slot>
      <ants-search-date-picker
        v-if="showDatePicker"
        v-bind="$attrs"
        v-on="$listeners"
      />

      <template v-for="(item, idx) in searchArr">
        <ants-search-input
          v-if="item"
          :key="idx"
          :search-key="item.key"
          :search-value="item.value"
          :placeholder-text="item.name"
          v-bind="$attrs"
          v-on="$listeners"
        />
      </template>

      <slot name="settings"></slot>

      <TableSetting v-if="showTableSetting" />
    </div>
    <!-- 检索输入框 end -->
  </div>
</template>

<script>
export default {
  name: 'TableQueryForm',
  props: {
    isPhoneTop: {
      type: Boolean,
      default: true
    },
    searchArr: {
      type: Array,
      default: () => []
    },
    showDatePicker: {
      type: Boolean,
      default: false
    },
    showTableSetting: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss" scoped>
// 小屏幕下搜索框样式
@media screen and (max-width: 767px) {
  .phone-top.flex {
    flex-direction: column;
    align-items: flex-start;

    .ants-search_input {
      margin-top: 20px;
    }
  }
}
</style>
