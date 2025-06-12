<template>
  <ants-form
    :model="tableForm"
    :rules="formRules"
    ref="tableFormRef"
    :status-icon="false"
    class="ants-table_form_error"
  >
    <el-table
      :data="tableForm.tableData"
      size="small"
      style="margin-top: -10px"
    >
      <ants-table-column label="匹配类型" width="180">
        <template #default="{ row, $index }">
          <ants-form-item
            :prop="`tableData.${$index}.type`"
            :rules="formRules.type"
          >
            <ants-select
              v-model="row.type"
              placeholder="请选择"
              size="small"
              @change="(val) => changeType(val, row)"
            >
              <ants-option
                v-for="(item, key) in typeObj"
                :key="key"
                :label="item.name"
                :value="key"
              />
            </ants-select>
          </ants-form-item>
        </template>
      </ants-table-column>
      <ants-table-column label="逻辑 | 匹配目标" width="120">
        <template #default="{ row, $index }">
          <ants-form-item
            :prop="`tableData.${$index}.handle`"
            :rules="formRules.handle"
          >
            <ants-select
              v-model="row.handle"
              placeholder="请选择"
              @change="(val) => changeHandle(val, row)"
              size="small"
            >
              <ants-option
                v-for="(item, idx) in (typeObj[row.type] || {}).handle"
                :key="idx + '_' + $index"
                :label="handleObj[item]"
                :value="item"
              />
            </ants-select>
          </ants-form-item>
        </template>
      </ants-table-column>

      <ants-table-column min-width="250">
        <template #default="{ row, $index }">
          <ants-form-item
            v-show="row.type"
            :prop="`tableData.${$index}.content`"
            :rules="formRules.content"
          >
            <!-- 如果为空，不存在则不用填写，默认传递空字符串 -->
            <div v-if="row.handle == 'null'"></div>

            <!-- 区域 -->
            <AreaDropdown
              v-else-if="row.type === 'geoip'"
              ref="AreaDropdownRef"
              v-model="row.content"
            />

            <!-- 后缀 -->
            <FileExtension
              ref="FileExtensionRef"
              v-else-if="row.type === 'exten'"
              v-model="row.content"
            >
              <el-button icon="el-icon-plus" size="small" class="max-w-full">
                <span class="truncate inline-block w-full pr-sm -ml-1">
                  {{ row.content || antsT('请选择文件类型') }}
                </span>
              </el-button>

              <!-- <ants-input
                type="textarea"
                v-model.trim="row.content"
                :autosize="{ minRows: 1, maxRows: 10 }"
                placeholder="jpg|png|gif|css"
                @input="inputContent"
              /> -->
            </FileExtension>

            <!-- 时间 -->
            <TimePicker v-else-if="row.type === 'time'" v-model="row.content" />

            <!-- 星期 -->
            <WeekDropdown
              v-else-if="row.type === 'week'"
              v-model="row.content"
            />

            <!-- 请求方法 -->
            <MethodDropdown
              v-else-if="row.type === 'method'"
              v-model="row.content"
            />

            <!-- 请求端口 -->
            <!-- <ants-input-number
              v-else-if="row.type === 's_port'"
              size="small"
              v-model="row.content"
              placeholder="端口"
              :min="0"
              :max="65535"
              :controls="false"
            /> -->

            <!-- int 数值类型的 -->
            <div v-else-if="(typeObj[row.type] || {}).type === 'int'">
              <ants-input-number
                size="small"
                v-model="row.content"
                placeholder="请输入"
                :min="row.handle == 'ble' ? 2 : (typeObj[row.type] || {}).min || 0"
                :max="(typeObj[row.type] || {}).max || 99999999"
              />
              <span class="ml-xs">{{
                antsT((typeObj[row.type] || {}).unit)
              }}</span>
            </div>

            <!-- bool 布尔值类型的 -->
            <ants-radio-group
              v-else-if="(typeObj[row.type] || {}).type === 'bool'"
              v-model="row.content"
              size="mini"
            >
              <ants-radio :label="0" text="失败" />
              <ants-radio :label="1" text="成功" />
            </ants-radio-group>

            <!-- 其他 text类型 -->
            <ants-input
              v-else
              size="small"
              v-model="row.content"
              :placeholder="(typeObj[row.type] || {}).tips"
            />
          </ants-form-item>
        </template>
      </ants-table-column>

      <ants-table-column width="60" align="right">
        <template #default="{ row, $index }">
          <span
            class="el-icon-delete-solid text-2xl text-error cursor-pointer"
            :class="{
              'text-ants-text-4 cursor-not-allowed': $index === 0
            }"
            @click="deleteItem(row, $index)"
          ></span>
        </template>
      </ants-table-column>
    </el-table>
    <div class="text-center" style="margin: 0">
      <span
        v-if="tableForm.tableData.length < 6"
        class="inline-block p-df text-primary el-icon-plus cursor-pointer"
        @click="addNewRow"
      >
        {{ antsT('新增一行') }}</span
      >
    </div>
  </ants-form>
</template>

<script>
import FileExtension from '../../../FileExtension'
import AreaDropdown from '../../../AreaDropdown'

import TimePicker from './TimePicker'
import WeekDropdown from './WeekDropdown'
import MethodDropdown from './MethodDropdown'
// import CodePopover from './CodePopover'
// import AsWeight from './AsWeight'
// import MethodPercent from './MethodPercent'

import { handleObj, typeObj } from '../../rule-name'

const baseTableData = {
  // 匹配类型
  type: '',
  // 匹配逻辑
  handle: '',
  // 匹配内容
  content: ''
}

export default {
  components: {
    FileExtension,
    AreaDropdown,
    TimePicker,
    WeekDropdown,
    MethodDropdown
    // CodePopover,
    // AsWeight,
    // MethodPercent
  },
  data() {
    // 移除来源验证
    if (!this.$mode['176_179']) {
      delete typeObj.ip_referer_verify
    }

    return {
      typeObj,
      handleObj,

      tableForm: {
        tableData: [
          {
            ...baseTableData
          }
        ]
      },

      formRules: {
        type: [
          {
            required: true,
            message: '请选择匹配类型',
            trigger: 'change'
          }
        ],
        handle: [
          {
            required: true,
            message: '请选择逻辑',
            trigger: 'change'
          }
        ],
        content: [
          {
            required: true,
            message: '匹配目标不能为空',
            // trigger: ['blur', 'change']
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 表格表单规则验证
     */

    submitTabelForm() {
      let flag
      this.$refs.tableFormRef.validate((valid) => {
        if (!valid) {
          flag = false
          return
        }
        flag = this.tableForm.tableData
      })
      return flag
    },

    /**
     * @description: 选择匹配类型
     * @param {*} val
     */

    changeType(val, row) {
      row.handle = this.typeObj[val].handle[0]
      if (this.typeObj[val].type === 'bool') {
        row.content = typeObj[row.type].default || 0
      } else {
        // 设置默认值
        if ((typeObj[row.type] || {}).default) {
          row.content = typeObj[row.type].default
          return
        }
        row.content = ''
      }
    },

    // 选择操作逻辑
    changeHandle(val, row) {
      console.log('val', val, row)
      // 如果int类型的为小于操作，则设置默认值为1
      if (val == 'ile' || val == 'bge') {
        row.content = 1
      }

      if (val == 'ble') {
        row.content = 2
      }

      // 如果为 null(不存在)，则设置content 为空字符串
      if (val == 'null') {
        row.content = ' '
      }
    },

    /**
     * @description: 文件后缀，匹配内容输入框改变，对应勾选值改变
     * @param {*} val
     */

    inputContent(val) {
      let arr = []
      if (val != '') {
        arr = val.split('|')
      }
      this.$refs.FileExtensionRef.content = arr
    },

    /**
     * @description: 点击删除
     * @param {*} row
     */

    deleteItem(row, idx) {
      if (idx === 0) return
      this.tableForm.tableData.splice(idx, 1)
    },

    /**
     * @description: 点击新增一行
     */

    addNewRow() {
      // 限制最多添加 6条
      if (this.tableForm.tableData.length >= 6) return
      this.tableForm.tableData.push({
        ...baseTableData
      })
    }
  }
}
</script>
