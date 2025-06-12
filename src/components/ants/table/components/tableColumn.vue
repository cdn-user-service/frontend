<template>
  <el-table-column
    :label="antsT(label)"
    :align="align || tabelConfig.align"
    :fixed="fixed || isAutoFixed"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- 继承插槽 这两个都是必须的 slot 插槽-->
    <!-- <template v-for="(index, name) in $slots" :slot="name">
      <slot :name="name" />
    </template> -->

    <!-- 作用域插槽 scope slot -->
    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
  </el-table-column>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'AntsTableColumn',
  props: {
    label: String,
    align: String,

    // 操作列表自动固定右侧
    fixed: [String, Boolean],
    autoFixed: Boolean
  },
  computed: {
    ...mapState(['tabelConfig', 'isPhone']),
    isAutoFixed() {
      return this.autoFixed && (this.isPhone ? false : 'right')
    }
  }
  // render(h, vm) {
  //   return h('el-table-column', {
  //     scopedSlots: this.$scopedSlots
  //   })
  // }
}
</script>
