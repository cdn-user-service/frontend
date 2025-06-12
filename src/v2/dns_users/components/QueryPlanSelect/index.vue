<template>
  <ants-select
    v-model="selectValue"
    :multiple="multiple"
    filterable
    :clearable="false"
    placeholder="请选择套餐"
    :loading="loading"
    :size="size"
    v-bind="$attrs"
    v-on="$listeners"
    class="query-user-select"
    :class="{ 'el-icon-box ants-select-bgc': isBgc }"
  >
    <el-option
      v-for="item in planList"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    >
      <div class="flex justify-between">
        <span>{{ item.name }}</span>

        <span class="text-ants-text-4 text-sm pl-sm" v-if="item.id">
          {{ `${item.usedDomainSum} / ${item.maxDomainSum}` }}
        </span>
      </div>
    </el-option>
  </ants-select>
</template>

<script>
// API
import { getList } from '@/v2/dns_users/api/dns/plan'

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
    isBgc: Boolean
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
        return this.value || 0
      },
      set(val) {
        this.$emit('updateValue', val)
      }
    }
  },
  created() {
    this.getPlanList()
  },
  methods: {
    /**
     * @description: 查询用户已有套餐
     * @param {*} queryString
     */

    async getPlanList() {
      this.loading = true
      this.planList = [
        {
          id: 0,
          name: '免费套餐',
          maxDomainSum: 0,
          usedDomainSum: 0
        }
      ]
      const { data: res } = await getList({
        domain: '',
        mode: 1,
        pagenum: 1,
        pagesize: 200
      })
      this.loading = false
      if (res.code !== 1) return
      const paid = (res.data || {}).paid || {}
      const list = paid.list || []
      const arr = list.map(item => {
        return {
          id: item.id,
          name: (item.name || {}).productName,
          maxDomainSum: item.maxDomainSum || 0,
          usedDomainSum: item.usedDomainSum || 0
        }
      })
      this.planList.push(...arr)
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
