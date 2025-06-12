<template>
  <el-dropdown placement="bottom" trigger="click" class="max-w-full">
    <el-button
      icon="el-icon-plus"
      size="small"
      class="max-w-full mr-sm"
      style="padding:8px 10px;"
    >
      <span class="truncate inline-block w-full pr-sm -ml-1 text-sm">
        {{ weekData.title }}
      </span>
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <li>
        <div class="pb-sm px-lg border-b border-ants-border-4">
          <ants-checkbox
            v-model="checkAll"
            :indeterminate="isIndeterminate"
            @change="changeCheckAll"
            text="全选"
          />
        </div>
        <div class="px-lg">
          <ants-checkbox-group
            v-model="checkWeeK"
            @change="changeCheckWeek"
            class="py-sm space-y-3"
          >
            <ants-checkbox
              v-for="(text, key) in weekObj"
              :label="key"
              :key="key"
              class="block"
              :text="text"
            />
          </ants-checkbox-group>
        </div>
      </li>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
const weekObj = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  0: '周日'
}

const checkAllArr = Object.keys(weekObj).map(key => key)
export default {
  props: ['value'],
  model: {
    event: 'updateValue'
  },

  data() {
    return {
      weekObj,
      checkAllArr,
      // 星期是否全选
      checkAll: false,
      // 星期是否半选
      isIndeterminate: false,
      // 选中星期
      checkWeeK: []
    }
  },
  computed: {
    // 星期显示 title，绑定 value
    weekData() {
      const arr = []
      Object.keys(weekObj).forEach(key => {
        if (this.checkWeeK.indexOf(key) != -1) {
          arr.push(weekObj[key])
        }
      })
      console.log(arr, this.checkWeeK)

      return {
        title: arr.join('|') || '请选择星期',
        value: this.checkWeeK.join('|')
      }
    }
  },
  created() {
    // 初始化
    if (this.value) {
      this.checkWeeK = this.value.split('|')
    }
    // 如果全选
    this.checkAll = this.checkWeeK.length === this.checkAllArr.length
  },
  methods: {
    // 星期点击全选
    changeCheckAll(checked) {
      this.checkWeeK = checked ? this.checkAllArr : []
      this.isIndeterminate = false

      this.updateContentInput()
    },

    // 星期勾选
    changeCheckWeek(val) {
      const checkedCount = val.length
      const total = this.checkAllArr.length
      this.checkAll = checkedCount === total
      this.isIndeterminate = checkedCount > 0 && checkedCount < total

      this.updateContentInput()
    },

    /**
     * @description: 给父组件赋值
     */

    updateContentInput() {
      this.$emit('updateValue', this.weekData.value)
    }
  }
}
</script>
