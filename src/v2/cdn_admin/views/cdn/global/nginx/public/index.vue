<template>
  <div>
    <ConfForm
      ref="ConfFormRef"
      title="公共配置"
      :group-str="groupStr"
      :base-data="baseData"
      :filter="filter"
    />
  </div>
</template>

<script>
import ConfForm from '../components/ConfForm'

const baseData = {}

export default {
  components: {
    ConfForm
  },
  data() {
    return {
      // 分组标识
      groupStr: 'common',
      // 基础表单数据
      baseData,
      filter: {
        // 需要判断是否需要渲染
        special_ports: !this.$mode['176_179']
      }
    }
  },
  created() {},
  methods: {}
}
</script>
