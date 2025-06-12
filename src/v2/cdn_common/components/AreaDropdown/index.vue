<template>
  <el-dropdown placement="bottom" trigger="click" class="max-w-full">
    <!-- <slot></slot> -->
    <el-button icon="el-icon-plus" size="small" class="max-w-full">
      <span class="truncate inline-block w-full pr-sm -ml-1">
        {{ checkData.title }}
      </span>
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <li class="area-dropdown-box">
        <el-tabs v-model="activeName">
          <el-tab-pane
            v-for="item1 in areaArr"
            :key="item1.value"
            :label="antsT(item1.title)"
            :name="item1.value"
            class="space-y-10 py-sm"
          >
            <div class="px-lg" v-for="item2 in item1.child" :key="item2.value">
              <el-checkbox
                :indeterminate="
                  item2.check.length > 0 &&
                    item2.check.length < item2.childLength
                "
                v-model="item2.all"
                @change="checked => handleCheckAllChange(checked, item2)"
              >
                <strong class="text-ants-text-1">{{
                  antsT(item2.title)
                }}</strong>
              </el-checkbox>
              <ants-checkbox-group
                v-model="item2.check"
                @change="val => changeItem(val, item2)"
              >
                <el-row :gutter="10">
                  <el-col
                    class="mt-xs"
                    :span="8"
                    v-for="(item3, key3) in item2.child"
                    :key="key3"
                  >
                    <ants-checkbox :label="key3" :text="item3" />
                  </el-col>
                </el-row>
              </ants-checkbox-group>
            </div>
          </el-tab-pane>
        </el-tabs>
      </li>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
// 基础区域数据
import areaData from './area'
export default {
  props: ['value'],
  model: {
    event: 'updateValue'
  },
  data() {
    return {
      activeName: 'CN',
      areaArr: []
    }
  },
  computed: {
    // 计算选中显示的字符串
    checkData() {
      // 1、如果子全选中，则显示父title，否则显示子title
      let titleArr = []
      let titleStr = ''
      // 构造选中值得字符串， 以 | 分隔
      let valueArr = []
      this.areaArr.forEach(item1 => {
        // 判断大洲是否全选
        item1.all = item1.child.every(it => it.all)

        item1.child.forEach(item2 => {
          // 如果没有选中
          if (!item2.check.length) return
          // 当前选中的 title 数组
          const checkTitleArr = item2.check.map(key2 => {
            return item2.child[key2]
          })
          // 当前选中的 title 字符串
          const checkTitleStr = checkTitleArr.join('|')
          // 当前所有选中的
          titleArr = [...titleArr, ...checkTitleArr]

          // 如果全选，显示父 title, 输出父 value
          if (item2.all) {
            // 如果全选，显示父 title，移除已选子 title
            titleStr = titleArr.join('|').replace(checkTitleStr, item2.title)

            // 如果所有都全选
            // if (item1.all) {
            //   titleStr = titleStr.replace(item1.check.join('|'), item1.title)
            // }

            // 重置 titleArr 数组，这一步关键
            titleArr = titleStr.split('|')
          } else {
            // 如果非全选，显示子 title
            titleStr = titleArr.join('|')
          }

          // 构造选中的值
          valueArr = [...valueArr, ...item2.check]
        })
      })
      return {
        title: titleStr || this.antsT('请选择区域'),
        value: valueArr.join('|')
      }
    }
  },
  created() {
    this.initArea()
  },
  methods: {
    /**
     * @description: 数据初始化
     */

    initArea() {
      // 回显数据
      const valArr = this.value.split('|')
      console.log(valArr)

      areaData.forEach((item1, idx) => {
        // 大洲全选
        item1.check = []

        item1.child.forEach((item2, idx2) => {
          // 选中盒子
          item2.check = []

          // 设置分区绑定数据，分区全选对应的值
          const keyArr = [] // 绑定数据数组
          for (const key in item2.child) {
            // 如果回显被选中
            if (valArr.indexOf(key) != -1) {
              item2.check.push(key)
            }
            keyArr.push(key)
          }
          item2.value = keyArr.join('|')
          item2.keyArr = keyArr
          // 设置 child 长度，因为 对象无法通过 .length 获取长度，在这里设置比较方便
          item2.childLength = keyArr.length

          // 设置分区全选状态
          item2.all = item2.childLength === item2.check.length

          // 设置大洲全选数据
          item1.check.push(item2.value)
        })
      })
      this.areaArr = areaData
    },
    /**
     * @description: 点击全选
     * @param {*} val
     * @param {*} item2
     */

    handleCheckAllChange(checked, item2) {
      // 全选中
      if (checked) {
        item2.check = item2.keyArr
      } else {
        // 全不选中
        item2.check = []
      }
      this.updateContentInput()
    },

    /**
     * @description: 选择单个
     * @param {*} val
     * @param {*} item2
     */

    changeItem(val, item2) {
      // 设置全选状态
      item2.all = item2.childLength === item2.check.length

      this.updateContentInput()
    },

    /**
     * @description: 给父组件赋值
     */

    updateContentInput() {
      this.$emit('updateValue', this.checkData.value)
    }
  }
}
</script>

<style lang="scss">
.area-dropdown-box {
  width: 425px;
  .el-tabs__content {
    max-height: 400px;
    overflow-y: auto;
  }
  .el-tabs__nav-wrap {
    padding-left: 20px;
    padding-right: 20px;
  }
  .el-checkbox__label {
    font-size: 13px;
  }
}
</style>
