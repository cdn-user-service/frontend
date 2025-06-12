<template>
  <ants-dialog
    :title="`${title}解析记录`"
    v-model="dialogVisible"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
    ref="dialogRef"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="110px"
    >
      <ants-form-item label="主机记录" prop="top">
        <ants-input
          v-model="form.top"
          placeholder="请输入主机记录"
          disabled
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="记录类型" prop="recordType">
        <ants-select v-model="form.recordType" placeholder="请选择记录类型">
          <ants-option
            v-for="item in recordTypeList"
            :key="item"
            :label="item"
            :value="item"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="线路类型" prop="line">
        <ants-select
          v-model="form.line"
          filterable
          placeholder="请选择线路类型"
        >
          <ants-option
            v-for="(item, key) in lineList"
            :key="key"
            :label="item"
            :value="key"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="记录值" prop="value">
        <ants-input
          v-model="form.value"
          placeholder="请输入记录值"
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="TTL" prop="ttl">
        <ants-input-number
          v-model="form.ttl"
          :step="1"
          :min="1"
          :precision="0"
          placeholder="TTL"
        ></ants-input-number>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// 表单初始化数据
const defaultForm = {
  // 操作类型、create = 创建、update = 修改
  handle: 'create',
  // 记录ID, 添加的时候为空
  recordId: null,
  // 主机记录
  top: '',
  // 记录类型
  recordType: '',
  // 线路类型
  line: '',
  // 记录值
  value: '',
  // ttl
  ttl: 600
}

export default {
  props: {
    cname: String,
    dnsConfigId: String,
    // 可选择的IP；列表
    ipsArr: Array,
    lineList: [Array, Object]
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      // 记录类型列表
      recordTypeList: ['A', 'CNAME'],

      form: {
        ...defaultForm
      },

      formRules: {
        // 添加DNS对话框的规则
        top: [
          {
            required: true,
            message: '请输入主机记录',
            trigger: ['change', 'blur']
          }
        ],
        recordType: [
          {
            required: true,
            message: '请选择记录类型',
            trigger: 'change'
          }
        ],
        line: [
          {
            required: true,
            message: '请选择线路类型',
            trigger: 'change'
          }
        ],
        value: [
          {
            required: true,
            message: '请输入记录值',
            trigger: ['change', 'blur']
          }
        ],
        ttl: [
          {
            required: true,
            message: '请输入TTL',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     */

    showDialog(row = {}, handle = '') {
      this.dialogVisible = true
      this.title = '添加'
      if (row.recordId) {
        this.title = '编辑'
      }
      this.form = {
        ...defaultForm,
        ...row
      }
      this.form.top = this.cname
      this.form.handle = handle
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const res = await this.$listeners.saveSiteAttr({
          custom_dns: JSON.stringify({
            ...this.form,
            dnsConfigId: this.dnsConfigId
          })
        })

        this.$refs.dialogRef.btnLoading = false
        if (!res) return
        this.$parent.getTableData()
        this.dialogVisible = false
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
