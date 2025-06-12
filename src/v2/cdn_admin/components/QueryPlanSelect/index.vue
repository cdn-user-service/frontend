<template>
  <ants-select
    v-model="selectValue"
    :multiple="multiple"
    filterable
    clearable
    placeholder="请选择用户套餐"
    :loading="loading"
    :size="size"
    v-bind="$attrs"
    class="query-user-select"
    :class="{ 'el-icon-box ants-select-bgc': isBgc }"
    @change="changePlan"
  >
    <template v-if="!isAll">
      <ants-option
        v-for="item in planList"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </template>

    <el-option-group
      v-else
      v-for="group in planList"
      :key="group.label"
      :label="group.label"
    >
      <el-option
        v-for="item in group.options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
        {{ item.label }}
      </el-option>
    </el-option-group>
  </ants-select>
</template>

<script>
// API
import { getSuitListByUserId } from '@/v2/cdn_admin/api/cdn/product'

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
    // 用户ID
    userId: [String, Number],
    // 是否查询所有的套餐，包括已过期的套餐
    isAll: Boolean
  },
  data() {
    return {
      loading: false,
      planList: []
    }
  },
  watch: {
    // 监听 userId 变化， 查询 用户套餐
    userId: function(newVal, oldVal) {
      // 如果清空用户
      if (!newVal) {
        this.selectValue = null
        this.planList = []
        return
      }
      this.getPlanListByUserId(this.value)
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
  methods: {
    /**
     * @description: 根据用户 ID 查询套餐
     * @param {*} active 默认选中ID
     */

    async getPlanListByUserId(active = '') {
      this.loading = true
      this.planList = []
      this.selectValue = ''
      try {
        const { data: res } = await getSuitListByUserId({
          userId: this.userId,
          // 查询用户所有的套餐，包括已过期套餐
          all: this.isAll ? 1 : undefined
        })
        if (res.code !== 1) return

        this.isAll
          ? this.setAllPlan(res.data, active)
          : this.setAvailablePlan(res.data, active)
      } finally {
        this.loading = false
      }
    },

    // 只查询可用套餐
    setAvailablePlan(data = [], active) {
      this.planList = data.map(item => {
        return {
          label: item.productName,
          value: item.serial_number
        }
      })
      if (this.planList.length) {
        this.selectValue = active || this.planList[0].value
      }
      this.changePlan(this.selectValue)
    },

    // 查询所哟套餐，包括已过期的套餐
    setAllPlan(data = [], active) {
      const keys = []
      const vals = []
      data.forEach(item => {
        const {
          serial_number: value,
          productName: label,
          statusMsg = '其他'
        } = item
        const idx = keys.indexOf(statusMsg)

        if (idx === -1) {
          keys.push(statusMsg)
          vals.push({
            label: statusMsg,
            options: [
              {
                label,
                value
              }
            ]
          })
          return
        }
        vals[idx].options.push({
          label,
          value
        })
      })

      const sortArr = [
        '正常启用',
        '已升级',
        '已用完',
        '已过期',
        '被禁用',
        '被注销',
        '已清算',
        '不可用',
        '其他'
      ]

      console.log('vals:', vals)

      this.planList = vals.sort((a, b) => {
        // 重新排序：正常启用 | 已升级 | 已用完 | 已过期 | 被禁用 | 被注销 | 已清算 | 不可用 | 其他
        const idxA = sortArr.indexOf(a.label)
        const idxB = sortArr.indexOf(b.label)
        if (idxA === -1 || idxB === -1) return 0
        return idxA - idxB
      })

      if (vals.length) {
        this.selectValue = active || this.planList[0].options[0].value
      }
      this.changePlan(this.selectValue)
    },

    /**
     * @description: 套餐切换
     */

    changePlan(val) {
      this.$emit('change', val)
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
