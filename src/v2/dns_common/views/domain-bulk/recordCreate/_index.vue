<template>
  <div class="bulk-record-create">
    <el-card class="content-box animated fadeIn">
      <div>
        <strong>{{ antsT('选择域名') }}</strong>
      </div>
      <QueryDomainSelect
        ref="QueryDomainSelectRef"
        style="width:100%;"
        class="mt-lg"
        :multiple="true"
        value-str="id"
      />
    </el-card>

    <el-card class="content-box animated fadeIn">
      <div>
        <strong>{{ antsT('添加记录') }}</strong>
      </div>

      <el-form
        :model="form"
        :rules="formRules"
        class="bulk-record-form"
        ref="formRef"
      >
        <el-table :data="form.recordsList" style="width:100%;">
          <ants-table-column label="主机记录" prop="top" min-width="100">
            <template #default="{ row, $index }">
              <el-form-item
                :prop="`recordsList.${$index}.top`"
                :rules="formRules.top"
              >
                <ants-input
                  size="small"
                  v-model="row.top"
                  placeholder="请输入主机记录"
                />
              </el-form-item>
            </template>
          </ants-table-column>
          <ants-table-column
            label="记录类型"
            prop="record_type"
            min-width="100"
          >
            <template #default="{ row, $index }">
              <el-form-item
                :prop="`recordsList.${$index}.record_type`"
                :rules="formRules.record_type"
              >
                <TypeSelect
                  v-model="row.record_type"
                  ref="sortRef"
                  @change="changeSort(row, row.record_type)"
                />
              </el-form-item>
            </template>
          </ants-table-column>
          <ants-table-column
            label="线路类型"
            prop="line"
            class-name="line-table-column"
            min-width="100"
          >
            <template #default="{ row, $index }">
              <el-form-item
                :prop="`recordsList.${$index}.line`"
                :rules="formRules.line"
              >
                <LineCascader
                  v-model="row.line"
                  placeholder="默认"
                  :index="$index"
                  ref="cascaderRef"
                />
              </el-form-item>
            </template>
          </ants-table-column>
          <ants-table-column label="记录值" prop="value" min-width="130">
            <template #default="{ row, $index }">
              <el-form-item
                :prop="`recordsList.${$index}.value`"
                :rules="formRules.value"
                ref="valueFormItemRef"
              >
                <ants-input
                  size="small"
                  ref="valueRef"
                  placeholder="请输入记录值"
                  v-model="row.value"
                />
              </el-form-item>
            </template>
          </ants-table-column>

          <ants-table-column label="权重" min-width="70">
            <template #default="{ row, $index }">
              <el-form-item
                :prop="`recordsList.${$index}.weight`"
                :rules="formRules.weight"
              >
                <ants-input
                  size="small"
                  ref="weightRef"
                  placeholder="请输入权重"
                  v-model="row.weight"
                />
              </el-form-item>
            </template>
          </ants-table-column>

          <ants-table-column label="MX" min-width="70">
            <template #default="{ row, $index }">
              <span v-if="row.record_type != 'MX'">-</span>
              <el-form-item
                :prop="`recordsList.${$index}.mx`"
                :rules="formRules.mx"
                v-else
              >
                <ants-input
                  size="small"
                  ref="mxRef"
                  placeholder="请输入MX"
                  v-model="row.mx"
                />
              </el-form-item>
            </template>
          </ants-table-column>

          <ants-table-column label="TTL(秒)" prop="ttl" min-width="70">
            <template #default="{ row, $index }">
              <span v-if="row.record_type == 'NS'">-</span>
              <el-form-item
                v-else
                :prop="`recordsList.${$index}.ttl`"
                :rules="formRules.ttl"
              >
                <ants-input
                  size="small"
                  ref="ttlRef"
                  type="number"
                  :min="60"
                  placeholder="请输入TTL"
                  v-model="row.ttl"
                />
              </el-form-item>
            </template>
          </ants-table-column>
          <ants-table-column label="操作" fixed="right" width="80">
            <template #default="{ $index }">
              <ants-button
                :type="!$index ? 'info' : 'danger'"
                size="mini"
                :disabled="!$index || btnLoading"
                @click="deleteRow($index)"
                text="删除"
              />
            </template>
          </ants-table-column>
        </el-table>
      </el-form>

      <div class="my-sm text-center text-primary cursor-color">
        <span @click="addRow" class="el-icon-plus inline-block p-xs">
          {{ antsT('添加一行') }}</span
        >
      </div>
    </el-card>

    <div class="content-box mb-xl">
      <ants-button
        type="primary"
        size="small"
        :loading="btnLoading"
        @click="submitForm"
        icon="el-icon-check"
        text="批量添加"
      />
    </div>
  </div>
</template>

<script>
// 组件
import QueryDomainSelectAdmin from '@/v2/dns_admin/components/QueryDomainSelect'
import QueryDomainSelectUsers from '@/v2/dns_users/components/QueryDomainSelect'

import TypeSelect from '../../domain-admin/record/TypeSelect.vue'
import LineCascader from '../../domain-admin/record/LineCascader.vue'
import formRules from '../../domain-admin/record/rules.js'

// api
const PROCESS_NAME = process.env.VUE_APP_NAME
const { batchMultidomainRecords } = require(`@/v2/${PROCESS_NAME}/api/dns/bulk`)

const defaultForm = {
  top: '@', // 主机记录
  record_type: 'A', // 记录类型
  value: '', // 记录值
  weight: '1', // 权重
  mx: '1', // mx
  ttl: '600', // ttl
  tcp: 0, // TCP
  line: {
    // 默认线路数据
    record_line: '100000000-999999999', // 线路编码
    record_line_id: 1, // 线路ID
    record_line_name: '默认', // 线路名称
    linetype: 1 // 线路类型，1表示官方线路，2表示自定义线路
  }
}
export default {
  components: {
    TypeSelect,
    LineCascader,
    QueryDomainSelect:
      PROCESS_NAME === 'dns_admin'
        ? QueryDomainSelectAdmin
        : QueryDomainSelectUsers
  },
  data() {
    return {
      btnLoading: false,
      // 默认线路
      defaultLine: {
        ...defaultForm.line
      },

      // 表格表单数据
      form: {
        recordsList: [
          {
            ...defaultForm
          }
        ]
      },
      formRules
    }
  },
  created() {},
  mounted() {},

  methods: {
    /**
     * @description: 多域名批量添加记录提交
     */

    submitForm() {
      const domainArr = this.$refs.QueryDomainSelectRef.value || []
      if (!domainArr.length) return this.$msg.error('请选择域名！')

      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true

        // 构造添加记录数组数组
        const infoArr = this.form.recordsList.map(item => {
          const lineObj = item.line || {}
          return {
            operation_type: 'add', // 操作类型
            record_id: null, // 当前记录ID,添加时为空
            top: item.top.trim(), // 主机记录
            record_type: item.record_type, // 记录类型
            value: item.value, // 记录值
            weight: item.weight + '', // 权重
            mx: item.record_type === 'MX' ? item.mx + '' || '1' : '0', // mx
            ttl: item.ttl + '', // ttl
            tcp: 0, // tcp, 0为关闭，1为开启

            // 线路值 start ==================================================================
            record_line: lineObj.record_line, // 线路code值
            record_line_id: lineObj.record_line_id, // 线路ID
            record_line_name: lineObj.record_line_name, // 线路名称
            linetype: lineObj.linetype, // 线路类型，1为已有线路，2为自定义线路
            line: lineObj // 线路绑定值，用于回显
          }
        })

        const { data: res } = await batchMultidomainRecords({
          ids: domainArr + '',
          info: JSON.stringify(infoArr)
        })

        this.btnLoading = false
        if (res.code !== 1) return

        this.$alert(
          `已为 ${domainArr.length} 个域名成功添加 ${infoArr.length} 条记录。数据同步可能需要一些时间，请耐心等候`,
          '批量添加记录成功',
          {
            center: true,
            type: 'success',
            callback: action => {
              this.resetForm()
            }
          }
        ).catch(err => err)
      })
    },

    // 重置表单
    resetForm() {
      this.form.recordsList = [
        {
          ...defaultForm,
          line: this.defaultLine
        }
      ]
      console.log(this.form)
      this.$refs.formRef.resetFields()
    },

    // 线路类型改变
    changeSort(row, val) {
      // 如果选择的记录类型为MX，则显示mx输入框，否则隐藏
      row.record_type = val

      // 记录类型改变，移除记录值验证信息
      this.$refs.valueFormItemRef.clearValidate()
    },

    // 设置默认线路的值
    setDefaultLine(lineObj = {}) {
      this.defaultLine = lineObj
    },

    // 点击添加一行
    addRow() {
      this.form.recordsList.push({
        ...defaultForm,
        line: this.defaultLine
      })
    },

    // 点击删除
    deleteRow(index) {
      this.form.recordsList.splice(index, 1)
    }
  }
}
</script>

<style lang="scss">
.bulk-record-create {
  .el-table__body-wrapper {
    .hover_div:hover {
      border: 1px solid theme('colors.ants-border-1');
      border-radius: 4px;
      padding-left: 5px;
    }
    .el-input__inner {
      padding: 0 5px;
    }
  }

  .bulk-record-form {
    .cell {
      overflow: visible;
    }
    .el-form-item__content {
      line-height: 32px;
    }
    .el-form-item {
      margin: 0;
    }
    .el-form-item__error {
      white-space: nowrap;
      top: -44px;
      left: 50%;
      transform: translateX(-50%);
      -ms-transform: translateX(-50%);
      -moz-transform: translateX(-50%);
      -webkit-transform: translateX(-50%);
      -o-transform: translateX(-50%);
      padding: 12px;
      border-radius: 4px;
      background-color: theme('colors.ants-bg-4');
      text-align: center;
      font-size: 14px;
      z-index: 9;
    }
    .el-form-item__error::before {
      content: '';
      position: absolute;
      top: 38px;
      left: 50%;
      margin-left: -8px;
      border: 8px solid rgba(0, 0, 0, 0);
      border-top-color: theme('colors.ants-bg-4');
    }
  }
  .el-table__body-wrapper {
    padding-top: 50px;
    margin-top: -50px;
  }
  .line-table-column {
    ::-webkit-input-placeholder {
      /* WebKit, Blink, Edge */
      color: theme('colors.ants-text-2');
    }

    :-moz-placeholder {
      /* Mozilla Firefox 4 to 18 */
      color: theme('colors.ants-text-2');
    }

    ::-moz-placeholder {
      /* Mozilla Firefox 19+ */
      color: theme('colors.ants-text-2');
    }

    :-ms-input-placeholder {
      /* Internet Explorer 10-11 */
      color: theme('colors.ants-text-2');
    }
  }
}
</style>
