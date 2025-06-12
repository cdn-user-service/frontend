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
import { getSoldList } from '@/v2/dns_admin/api/dns/plan'

const freePlan = {
  id: 0,
  name: '免费套餐',
  maxDomainSum: 0,
  usedDomainSum: 0
}
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
    // 用户名
    username: {
      required: true,
      type: [String, Number]
    }
  },
  data() {
    return {
      loading: false,
      planList: [freePlan]
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
  watch: {
    username: function(newVal) {
      if (!newVal) {
        this.planList = [freePlan]
        this.$emit('updateValue', 0)
      } else {
        this.getPlanList()
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 查询用户已有套餐
     */

    async getPlanList() {
      this.loading = true
      this.planList = [freePlan]
      const { data: res } = await getSoldList({
        user: this.username,
        key: 1,
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
      this.$emit('updateValue', 0)
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
