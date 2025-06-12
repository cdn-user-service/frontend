<template>
  <ants-select
    v-model="selectValue"
    :multiple="multiple"
    filterable
    :clearable="true"
    placeholder="请选择分组"
    :loading="loading"
    :size="size"
    v-bind="$attrs"
    v-on="$listeners"
    class="query-user-select"
    :class="{ 'el-icon-box ants-select-bgc': isBgc }"
  >
    <ants-option key="" label="默认分组" value=""> </ants-option>
    <ants-option
      v-for="item in planList"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    >
    </ants-option>
  </ants-select>
</template>

<script>
// API
import { getDomainGroupList } from '@/v2/cdn_users/api/cdn/site'

export default {
  name: 'QueryPlanSelect',
  props: {
    value: [String, Number, Boolean],
    // 是否为多选
    multiple: Boolean,
    // 大小
    size: {
      type: String,
      default: 'medium'
    },
    // 是否为背景选择框
    isBgc: Boolean,
    // 是否初始化获取数据
    init: Boolean
  },
  data() {
    return {
      loading: false,
      planList: []
    }
  },
  model: {
    event: 'updateValue'
  },
  computed: {
    selectValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('updateValue', val)
      }
    }
  },
  created() {
    if (this.init) {
      this.getDomainGroupList()
    }
  },
  methods: {
    /**
     * @description: 查询节点分组
     * @param {*} queryString
     */

    async getDomainGroupList(active = '') {
      this.loading = true
      this.planList = []
      const { data: res } = await getDomainGroupList({
        limit: 9999,
        name: '',
        page: 1
      })
      // console.log('res', res)

      this.loading = false
      if (res.code !== 1) return
      this.planList = res.data.list || []
      return null
    }
  }
}
</script>
<style lang="scss">
.query-user-select {
  width: 100%;
  .el-input {
    width: 100% !important;
  }
}
.query-user-select.ants-select-bgc {
  .el-input__inner {
    border: 2px solid theme('colors.ants-bg-5');
    background-color: theme('colors.ants-bg-5');
    border-radius: 6px;
    line-height: 56px;
    height: 56px;
    padding-left: 45px;
  }
  .el-input__inner:focus {
    border-color: theme('colors.primary');
  }

  &::before {
    position: absolute;
    left: 20px;
    top: 18px;
    z-index: 1;
    font-size: 16px;
    color: #c0c4cc;
  }
}
</style>
