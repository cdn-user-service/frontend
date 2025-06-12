<template>
  <div class="plan-attr-item">
    <!-- 名称 -->
    <span class="attr-name mr-sm inline-block text-ants-text-3">{{
      antsT(attrItem.name)
    }}</span>

    <!-- 数值型 -->
    <span class="attr-int-value" v-if="attrItem.valueType === 'int'">
      <!-- 流量 -->
      <span v-if="attrItem.attr === 'flow'">
        {{ flowUnit(attrItem.value) }}
      </span>

      <span v-else-if="attrItem.value">
        {{ attrItem.value }} {{ antsT(attrItem.unit) }}</span
      >

      <i class="el-icon-error text-error" v-else> {{ antsT('不支持') }}</i>
    </span>

    <!-- bool类型 -->
    <span v-else-if="attrItem.valueType === 'bool'">
      <span class="text-success el-icon-success" v-if="attrItem.value == 1">
        {{ antsT('支持') }}</span
      >
      <span class="text-error el-icon-error" v-else>
        {{ antsT('不支持') }}</span
      >
    </span>

    <!-- 字符串型 -->
    <span v-else>
      <span v-if="attrItem.value">{{ attrItem.value }}</span>
      <i class="el-icon-error text-error" v-else> {{ antsT('不支持') }}</i>
    </span>
  </div>
</template>

<script>
import { flowUnit } from '@/utils/unit'

export default {
  props: {
    attrItem: Object
  },
  methods: {
    flowUnit
  }
}
</script>

<style lang="scss" scoped>
.attr-name {
  min-width: 100px;
}
</style>
