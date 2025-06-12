<template>
  <div>
    <el-table
      v-loading="$root.loading"
      :border="!!tabelConfig.border"
      :stripe="!!tabelConfig.stripe"
      :size="tabelConfig.size"
      v-bind="$attrs"
      v-on="$listeners"
      :style="{ 'min-height': minHeight }"
    >
      <div slot="empty">
        <el-empty :description="antsT(emptyText)"> </el-empty>
      </div>

      <!-- 继承插槽 -->
      <template v-for="(index, name) in $slots" :slot="name">
        <slot :name="name" />
      </template>
    </el-table>

    <AntsPagination v-if="isPagination" v-bind="$attrs" v-on="$listeners" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'AntsTable',
  props: {
    // 为空时的描述文本
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    // 是否需要分页组件
    isPagination: {
      type: Boolean,
      default: true
    },
    minHeight: {
      type: String
    }
  },
  computed: {
    ...mapState(['tabelConfig'])
  },
  methods: {}
}
</script>
