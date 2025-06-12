<template>
  <ants-dialog
    title="清除HTTP响应头"
    ref="dialogRef"
    v-model="dialogVisible"
    width="1000px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="0"
      class="ants-table_form_error clear-header-form -mt-df"
    >
      <el-table :data="form.tableData" size="small" style="margin:0;">
        <ants-table-column label="Header类型" min-width="140">
          <template #default="{ row, $index }">
            <ants-form-item
              :prop="`tableData.${$index}.type`"
              :rules="formRules.type"
            >
              <ants-select
                v-model="row.type"
                placeholder="请选择Header类型"
                @change="changeHeaderType"
              >
                <ants-option
                  v-for="(value, key) in headerTypeList"
                  :key="key + '_' + $index"
                  :label="value.label"
                  :value="key"
                />
              </ants-select>
            </ants-form-item>

            <ants-form-item
              v-if="row.type === 'custom'"
              :prop="`tableData.${$index}.header`"
              :rules="formRules.header"
            >
              <ants-input
                v-model="row.header"
                placeholder="请输入响应头匹配名称"
              />
            </ants-form-item>
          </template>
        </ants-table-column>

        <ants-table-column label="匹配内容" min-width="200">
          <template #default="{ row, $index }">
            <ants-form-item
              :prop="`tableData.${$index}.content`"
              :rules="formRules.content"
            >
              <ants-input
                type="textarea"
                v-model="row.content"
                :autosize="{ minRows: 1, maxRows: 6 }"
                :placeholder="
                  `${antsT(headerTypeList[row.type].info)}，${antsT(
                    '一行一个'
                  )}`
                "
              />
            </ants-form-item>
          </template>
        </ants-table-column>

        <ants-table-column label="备注信息" min-width="140">
          <template #default="{ row, $index }">
            <ants-form-item
              :prop="`tableData.${$index}.info`"
              :rules="formRules.info"
            >
              <ants-input
                v-model="row.info"
                placeholder="请输入备注信息"
              />
            </ants-form-item>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="60" align="right">
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
    </ants-form>

    <div class="text-center pt-df">
      <span class="text-primary el-icon-plus cursor-pointer" @click="addNewRow">
        {{ antsT('新增一行') }}</span
      >
    </div>
  </ants-dialog>
</template>

<script>
const headerTypeList = {
  'Cache-Control': {
    label: 'Cache-Control',
    info: '指定客户程序请求和响应遵循的缓存机制'
  },
  'Content-Dispostion': {
    label: 'Content-Dispostion',
    info: '指定客户程序响应对象时激活文件下载设置默认的文件名'
  },
  'Content-Language': {
    label: 'Content-Language',
    info: '指定客户程序响应对象的语言'
  },
  Expires: {
    label: 'Expires',
    info: '指定客户程序响应对象的过期时间'
  },
  'Access-Control-Allow-Origin': {
    label: 'Access-Control-Allow-Origin',
    info: '指定允许的跨域请求的来源'
  },
  'Access-Control-Allow-Methods': {
    label: 'Access-Control-Allow-Methods',
    info: '指定允许的跨域请求方法'
  },
  'Access-Control-Allow-Credentials': {
    label: 'Access-Control-Allow-Credentials',
    info: '跨域请求时是否允许携带 Cookie'
  },
  'Access-Control-Max-Age': {
    label: 'Access-Control-Max-Age',
    info: '指定客户程序对特定资源的预取请求返回结果的缓存时间'
  },
  'Access-Control-Expose-Headers': {
    label: 'Access-Control-Expose-Headers',
    info: '指定允许访问的自定义头信息'
  },
  custom: {
    label: '自定义',
    info: '请输入响应头匹配内容'
  }
}
const defaultForm = {
  id: 0,
  type: 'Cache-Control',
  // 响应头名称，仅自定义时有
  header: '',
  content: '',
  info: ''
}

export default {
  props: {
    // 是否为批量操作，为批量操作是不需要提交请求
    bulk: Boolean
  },
  data() {
    return {
      dialogVisible: false,
      form: {
        tableData: [
          {
            ...defaultForm
          }
        ]
      },

      formRules: {
        type: [
          {
            required: true,
            message: '请选择Header类型',
            trigger: 'change'
          }
        ],
        header: [
          {
            required: true,
            message: '请输入响应头名称',
            trigger: ['change', 'blur']
          }
        ],
        content: [
          {
            required: true,
            message: '请输入匹配内容，一行一个',
            trigger: ['change', 'blur']
          }
        ],
        info: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['change', 'blur']
          }
        ]
      },

      headerTypeList
    }
  },
  methods: {
    // 对话框显示
    showDialog(row = {}) {
      this.dialogVisible = true
      this.form = {
        tableData: [
          {
            ...defaultForm
          }
        ]
      }
    },

    // 请求头改变
    changeHeaderType(val) {},

    // 表单提交
    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
         // mm_text
        const postArr = this.form.tableData.map(item => {
          const { type, content, header, info } = item
          return {
            id: 0,
            type,
            header: type === 'custom' ? header : type,
            content,
            info
          }
        })

        this.bulk ? this.submitByData(postArr) : this.submitByApi(postArr)
      })
    },

    // 提交方式一，发起请求
    async submitByApi(postArr = []) {
      this.$refs.dialogRef.btnLoading = true
      try {
        const res = await this.$listeners.saveSiteAttr({
          more_clear_headers: postArr
        })
        if (!res) return
        this.$listeners.refreshData()
        this.dialogVisible = false
      } finally {
        this.$refs.dialogRef.btnLoading = false
      }
    },

    // 提交方式二，输出数据，用于批量操作
    submitByData(postArr = []) {
      this.$emit('save', {
        mode: 'more_clear_headers',
        data: postArr
      })
      this.dialogVisible = false
      this.$msg.success('添加成功')
    },

    // 表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    },

    /**
     * @description: 点击删除一行
     * @param {*} row
     */

    deleteItem(row, idx) {
      if (idx === 0) return
      this.form.tableData.splice(idx, 1)
    },

    /**
     * @description: 点击新增一行
     */

    addNewRow() {
      this.form.tableData.push({
        ...defaultForm
      })
    }
  }
}
</script>

<style lang="scss">
.clear-header-form {
  .el-table .el-table__cell {
    vertical-align: top;
  }
  .el-textarea__inner {
    height: 36px;
  }
}
</style>
