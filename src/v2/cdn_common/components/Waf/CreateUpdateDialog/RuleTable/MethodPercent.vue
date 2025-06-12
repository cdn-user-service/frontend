<template>
  <el-popover
    placement="bottom"
    trigger="click"
    class="max-w-full"
    @show="popoverShow"
  >
    <div
      class="pb-df pt-sm px-lg border-b
         border-ants-border-3 flex items-center text-sm text-ants-text-4 font-bold"
    >
      <el-checkbox
        v-model="isCheckAll"
        :indeterminate="isIndeterminate"
        @change="changeCheckAll"
      />
      <span class="inline-block" style="width: 65px;padding-left:10px;"
        >{{antsT('类型')}}</span
      >
      <span class="inline-block mr-lg" style="width: 80px;">{{antsT('逻辑')}}</span>
      <span>{{antsT('万分比')}}</span>
    </div>
    <ul class="px-lg pb-sm">
      <li
        v-for="(item, key) in codeObj"
        :key="key"
        class="py-sm flex items-center border-b border-ants-border-3"
      >
        <el-checkbox-group v-model="checkCode" @change="changeCheckCode">
          <el-checkbox :label="key" style="width:80px;" >{{key.toUpperCase()}}</el-checkbox>
          <ants-select
            v-model="item.handle"
            style="width:80px;"
            class="mr-lg"
            size="small"
          >
            <ants-option
              v-for="handleItem in handleArr"
              :key="handleItem"
              :label="handleObj[handleItem]"
              :value="handleItem"
            />
          </ants-select>
          <ants-input-number
            size="small"
            v-model="item.value"
            :min="0"
            :max="10000"
            placeholder="万分比"
          />
        </el-checkbox-group>
      </li>
    </ul>

    <el-button
      slot="reference"
      icon="el-icon-plus"
      size="small"
      class="max-w-full mr-sm"
      style="padding:8px 10px;"
    >
      <span
        class="truncate inline-block w-full pr-sm -ml-1 text-sm"
        v-show="checkCode.length"
      >
        <span v-for="(item, key) in outputData" :key="key">
          【{{ key.toUpperCase() }} {{ handleObj[item.handle] }} {{ item.value }} ‱】
        </span>
      </span>
      <span v-show="!checkCode.length" class="pr-sm -ml-1 text-sm"
        >{{antsT('请选择请求类型比')}}</span
      >
    </el-button>
  </el-popover>
</template>

<script>
import { handleObj } from '../../rule-name'

const checkAllArr = ['get', 'post']

const codeObj = {
  get: {
    handle: 'ie',
    // 万分比 0 ~ 10000
    value: 0
  },
  post: {
    handle: 'ie',
    value: 0
  }
}
const handleArr = ['ie', 'ile', 'ige']

export default {
  props: ['value'],
  model: {
    event: 'updateValue'
  },
  data() {
    return {
      handleObj,
      handleArr,
      codeObj,
      // 选中的行
      checkCode: [],
      // 全选的数组
      checkAllArr,
      // 请求方法是否全选
      isCheckAll: false,
      // 请求方法是否半选
      isIndeterminate: false
    }
  },
  computed: {
    // 请求方法显示 title，绑定 value
    outputData() {
      const obj = {}
      this.checkCode.forEach(item => {
        obj[item] = this.codeObj[item]
      })
      return obj
    }
  },
  mounted() {
    this.checkCode = []
    // 初始化
    if (typeof this.value === 'object') {
      Object.keys(this.value).forEach(key => {
        const { handle, value } = this.value[key]
        this.checkCode.push(key)
        this.codeObj[key] = {
          handle,
          value
        }
      })
    }

    const checkedCount = this.checkCode.length
    const total = this.checkAllArr.length

    // 如果全选
    this.isCheckAll = checkedCount === total
    // 如果半选
    this.isIndeterminate = checkedCount > 0 && checkedCount < total

    this.updateContentInput()
  },
  methods: {
    /**
     * @description: popover 显示，并数据初始化
     */
    popoverShow() {},

    // 请求方法点击全选
    changeCheckAll(checked) {
      this.checkCode = checked ? this.checkAllArr : []
      this.isIndeterminate = false

      this.updateContentInput()
    },

    // 请求方法勾选
    changeCheckCode(val) {
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
      const val = this.checkCode.length > 0 ? this.outputData : ''
      this.$emit('updateValue', val)
    }
  }
}
</script>
