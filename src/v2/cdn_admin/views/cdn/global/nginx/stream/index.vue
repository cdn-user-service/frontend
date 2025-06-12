<template>
  <div>
    <ConfForm
      ref="ConfFormRef"
      title="Stream"
      :group-str="groupStr"
      :base-data="baseData"
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
      groupStr: 'stream',
      // 基础表单数据
      baseData
    }
  },
  created() {},
  methods: {
    async getFormObjData() {}
  }
}
</script>
