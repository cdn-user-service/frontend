<template>
  <div class="plan-used-item">
    <div class="inline-block rounded-xl bg-ants-bg-5 p-df">
      <!-- 数值型 -->
      <div class="attr-int-value" v-if="attrItem.valueType === 'int'">
        <span v-if="attrItem.value">
          <span v-if="!attrItem.hiddenUsed">
            {{ attrItem.used }}{{ antsT(attrItem.unit) }} /
          </span>
          {{ attrItem.value
          }}{{ antsT(attrItem.unit) }}
        </span>
        <span v-else>-</span>
      </div>

      <!-- bool类型 -->
      <div v-else-if="attrItem.valueType === 'bool'">
        <span class="text-success el-icon-success" v-if="attrItem.value == 1">
          {{antsT('支持')}}</span>
        <span class="text-error el-icon-error" v-else> {{antsT('不支持')}}</span>
      </div>

      <!-- 字符串型 -->
      <div v-else>{{ attrItem.value || '-' }}</div>
    </div>

    <!-- 名称 -->
    <div class="mt-df">
      {{antsT(attrItem.name)}}
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      attrItem: Object
    }
  }

</script>

<style lang="scss" scoped>
  .attr-name {
    min-width: 80px;
  }

</style>
