<template>
  <el-dropdown placement="bottom" trigger="click" class="max-w-full">
    <el-button
      icon="el-icon-plus"
      size="small"
      class="max-w-full mr-sm"
      style="padding:8px 10px;"
    >
      <span class="truncate inline-block w-full pr-sm -ml-1 text-sm">
        {{ outputData || '请选择请求方法' }}
      </span>
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <li>
        <div class="pb-sm px-lg border-b border-ants-border-4">
          <ants-checkbox
            v-model="isCheckAll"
            :indeterminate="isIndeterminate"
            @change="changeCheckAll"
            text="全选"
          />
        </div>
        <div class="px-lg">
          <ants-checkbox-group
            v-model="checkData"
            @change="changeCheckData"
            class="py-sm space-y-3"
          >
            <ants-checkbox
              v-for="item in baseDataArr"
              :label="item"
              :key="item"
              class="block"
              :text="item"
            />
          </ants-checkbox-group>
        </div>
      </li>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
const baseDataArr = [
    'GET',
    'POST',
    'HEAD',
    'DELETE',
    'CONNECT',
    'OPTION',
    'TRACE'
]
export default {
  props: ['value'],
  model: {
    event: 'updateValue'
  },
  data() {
    return {
      // 数据源
      baseDataArr,
      // 全选的数组
      checkAllArr: [...baseDataArr],
      // 请求方法是否全选
      isCheckAll: false,
      // 请求方法是否半选
      isIndeterminate: false,
      // 选中请求方法
      checkData: []
    }
  },
  computed: {
    // 请求方法显示 title，绑定 value
    outputData() {
      return this.checkData.join('|')
    }
  },
  created() {
    // 初始化
    if (this.value) {
      this.checkData = this.value.split('|')
    }
    // 如果全选
    this.isCheckAll = this.checkData.length === this.checkAllArr.length
  },
  methods: {
    // 请求方法点击全选
    changeCheckAll(checked) {
      this.checkData = checked ? this.checkAllArr : []
      this.isIndeterminate = false

      this.updateContentInput()
    },

    // 请求方法勾选
    changeCheckData(val) {
      const checkedCount = val.length
      const total = this.checkAllArr.length
      this.isCheckAll = checkedCount === total
      this.isIndeterminate = checkedCount > 0 && checkedCount < total

      this.updateContentInput()
    },

    /**
     * @description: 给父组件赋值
     */

    updateContentInput() {
      this.$emit('updateValue', this.outputData)
    }
  }
}
</script>
