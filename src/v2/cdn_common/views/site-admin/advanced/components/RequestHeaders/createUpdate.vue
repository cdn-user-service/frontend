<template>
  <ants-dialog
    :title="title + '自定义HTTP回源请求头'"
    ref="dialogRef"
    v-model="dialogVisible"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="110px"
    >
      <ants-form-item label="Header类型" prop="type">
        <ants-select
          v-model="form.type"
          placeholder="请选择Header类型"
          @change="changeHeaderType"
        >
          <ants-option
            v-for="(value, key) in headerTypeList"
            :key="key"
            :label="value.label"
            :value="key"
          >
          </ants-option>
        </ants-select>
      </ants-form-item>
      <ants-form-item
        label="请求头类型"
        prop="header"
        v-if="form.type === 'custom'"
      >
        <ants-input
          v-model.trim="form.header"
          placeholder="请输入回源HTTP请求头"
          maxlength="100"
        ></ants-input>
        <div
          class="text-sm text-ants-text-4 -mb-sm mt-2"
          style="line-height:1.5;"
        >
          {{
            antsT(
              '自定义回源请求头类型由 数字、英文字符及特殊字符 -_ 组成，不超过 100个字符'
            )
          }}
        </div>
      </ants-form-item>

      <ants-form-item label="匹配内容" prop="content">
        <ants-input
          type="textarea"
          v-model="form.content"
          :autosize="{ minRows: 6, maxRows: 20 }"
          maxlength="1000"
          :disabled="headerTypeList[form.type].disabled"
          :placeholder="`${headerTypeList[form.type].info}`"
        ></ants-input>
        <!-- <div class="text-sm text-ants-text-4">请自定义回源请求头类型由 数字、英文字符及特殊字符 -_ 组成，不超过 100个字符输入匹配内容，一行为一个</div> -->
      </ants-form-item>
      <ants-form-item label="备注信息" prop="info">
        <ants-input
          v-model="form.info"
          placeholder="请输入备注信息"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
const defaultForm = {
  id: 0,
  type: 'Accept-Encoding',
  // 回源请求头类型， 仅自定义时存在
  header: '',
  content: '',
  info: ''
}

const headerTypeList = {
  'Accept-Encoding': {
    label: 'Accept-Encoding',
    info: '请求头匹配内容长度为 1-1000 个字符，不支持中文，一行一个'
  },
  'Accept-Language': {
    label: 'Accept-Language',
    info: '请求头匹配内容长度为 1-1000 个字符，不支持中文，一行一个'
  },
  'User-Agent': {
    label: 'User-Agent',
    info: '请求头匹配内容长度为 1-1000 个字符，不支持中文，一行一个'
  },
  'Content-Type': {
    label: 'Content-Type',
    info: '请求头匹配内容长度为 1-1000 个字符，不支持中文，一行一个'
  },
  'Access-Control-Expose-Headers': {
    label: 'Access-Control-Expose-Headers',
    info: '请求头匹配内容长度为 1-1000 个字符，不支持中文，一行一个'
  },
  'X-Real-Port': {
    label: 'X-Real-Port',
    info: '$remote_port',
    disabled: true
  },
  'X-Request-Id': {
    label: 'X-Request-Id',
    info: '$request_id',
    disabled: true
  },
  'X-Req-Start-Time': {
    label: 'X-Req-Start-Time',
    info: '$request_start_time',
    disabled: true
  },
  'Client-Ip': {
    label: 'Client-Ip',
    info: '$remote_addr',
    disabled: true
  },
  'Client-Scheme': {
    label: 'Client-Scheme',
    info: '$scheme',
    disabled: true
  },
  custom: {
    label: '自定义',
    info: '请求头匹配内容长度为 1-1000 个字符，不支持中文，一行一个'
  }
}
export default {
  props: {
    // 是否为批量操作，为批量操作是不需要提交请求
    bulk: Boolean
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      form: { ...defaultForm },
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
            message: '请输入回源HTTP请求头',
            trigger: ['change', 'blur']
          }
        ],
        content: [
          {
            required: true,
            message: '请输入匹配内容',
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
      this.title = '添加'
      if (row.id) {
        this.title = '编辑'
        this.form = {
          ...row
        }
      }
    },

    changeHeaderType(val) {
      if (this.headerTypeList[val].disabled) {
        this.form.content = this.headerTypeList[val].info
      } else {
        this.form.content = ''
      }
    },

    // 添加提交
    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return

        const { type, header } = this.form
        const postObj = {
          ...this.form,
          header: type === 'custom' ? header.trim() : type
        }

        this.bulk ? this.submitByData(postObj) : this.submitByApi(postObj)
      })
    },

    // 提交方式一，发起请求
    async submitByApi(postObj = {}) {
      this.$refs.dialogRef.btnLoading = true
      try {
        const res = await this.$listeners.saveSiteAttr({
          proxy_set_header: [postObj]
        })
        if (!res) return
        this.$listeners.refreshData()
        this.dialogVisible = false
      } finally {
        this.$refs.dialogRef.btnLoading = false
      }
    },

    // 提交方式二，输出数据，用于批量操作
    submitByData(postObj = {}) {
      this.$emit('save', {
        prop: 'proxy_set_header',
        data: postObj
      })
      this.dialogVisible = false
      this.$msg.success('操作成功')
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
