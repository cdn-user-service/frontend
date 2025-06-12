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
      style="margin-top:-10px;"
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
              @change="val => changeType(val, row)"
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
            <ants-select v-model="row.handle" placeholder="请选择" size="small">
              <ants-option
                v-for="(item, idx) in typeObj[row.type] &&
                  typeObj[row.type].handle"
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
            <!-- 区域 -->
            <AreaDropdown
              v-if="row.type === 'area'"
              ref="AreaDropdownRef"
              v-model="row.content"
            />

            <!-- 后缀 -->
            <FileExtension
              ref="FileExtensionRef"
              v-else-if="row.type === 'suffix'"
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

            <!-- 返回状态码 -->
            <CodePopover
              v-else-if="row.type === 'return_code'"
              v-model="row.content"
            />

            <!-- 请求类型比 -->
            <MethodPercent
              v-else-if="row.type === 'method_weight'"
              v-model="row.content"
            />

            <AsWeight
              v-else-if="row.type === 'ants_weight'"
              v-model="row.content"
            />

            <!-- int 数值类型的 -->
            <div
              v-else-if="typeObj[row.type] && typeObj[row.type].type === 'int'"
            >
              <ants-input-number
                size="small"
                v-model="row.content"
                placeholder="请输入"
                :min="1"
                :max="10000"
              />
              <span class="ml-xs">{{
                antsT(typeObj[row.type] && typeObj[row.type].unit)
              }}</span>
            </div>

            <!-- bool 布尔值类型的 -->
            <ants-radio-group
              v-else-if="typeObj[row.type] && typeObj[row.type].type === 'bool'"
              v-model="row.content"
              size="mini"
            >
              <ants-radio label="0" text="不等于" />
              <ants-radio label="1" text="等于" />
            </ants-radio-group>

            <!-- 其他 text类型 -->
            <ants-input
              v-else
              size="small"
              v-model="row.content"
              :placeholder="typeObj[row.type] && typeObj[row.type].tips"
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
    <div class="text-center" style="margin:0">
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
import CodePopover from './CodePopover'
import AsWeight from './AsWeight'
import MethodPercent from './MethodPercent'

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
    MethodDropdown,
    CodePopover,
    AsWeight,
    MethodPercent
  },
  data() {
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
      this.$refs.tableFormRef.validate(valid => {
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
        row.content = '0'
      } else {
        row.content = ''
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
