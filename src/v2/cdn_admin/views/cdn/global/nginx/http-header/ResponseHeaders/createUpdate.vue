<template>
  <ants-dialog
    :title="title + '自定义HTTP响应头'"
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
        label="响应头名称"
        prop="header"
        v-if="form.type === 'custom'"
      >
        <ants-input
          v-model.trim="form.header"
          placeholder="请输入响应头匹配名称"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="匹配内容" prop="content">
        <ants-input
          type="textarea"
          v-model="form.content"
          :autosize="{ minRows: 6, maxRows: 20 }"
          :placeholder="
            `${antsT(headerTypeList[form.type].info)}，${antsT('一行一个')}`
          "
        ></ants-input>
        <!-- <div class="text-sm text-ants-text-4">请输入匹配内容，一行为一个</div> -->
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
  type: 'Cache-Control',
  // 响应头名称，仅自定义时有
  header: '',
  content: '',
  info: ''
}

const rules = {
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
}

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
export default {
  data() {
    return {
      dialogVisible: false,
      title: '添加',
      form: { ...defaultForm },

      formRules: rules,
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

    // 请求头改变
    changeHeaderType(val) {},

    // 添加提交
    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { type, header } = this.form
          const res = await this.$listeners.save({
            add_header: [
              {
                ...this.form,
                header: type === 'custom' ? header.trim() : type
              }
            ]
          })

          if (!res) return
          this.$emit('refresh')
          this.$msg.success('保存成功')
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
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
