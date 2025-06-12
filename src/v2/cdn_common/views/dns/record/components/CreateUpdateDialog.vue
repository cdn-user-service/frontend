<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '解析记录'"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
    >
      <ants-form-item label="主机记录" prop="top">
        <ants-input
          v-model="form.top"
          placeholder="请输入主机记录"
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
        <LineCascader
          v-model="form.line"
          style="width: 100%"
          v-if="$route.query.source === 'antsdns'"
        />
        <ants-select
          v-else
          v-model="form.line"
          filterable
          placeholder="请选择线路类型"
        >
          <ants-option
            v-for="(value, key) in lineList"
            :key="key"
            :label="value"
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
import LineCascader from './LineCascader'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doCreateRecord,
  doUpdateRecord
} = require(`@/v2/${PROCESS_NAME}/api/cdn/dns`)

const defaultForm = {
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
  components: {
    LineCascader
  },
  props: {
    lineList: [Array, Object]
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      // 记录类型列表
      recordTypeList: ['A', 'CNAME', 'TXT', 'AAAA'],
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
    showDialog(row) {
      this.dialogVisible = true
      this.title = '添加'
      if (row.recordId) {
        this.title = '修改'
      }
      this.form = {
        ...defaultForm,
        ...row,
        // DNSAPI id
        id: this.$route.query.id
      }
    },

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        try {
          this.$refs.dialogRef.btnLoading = true
          const { data } = await (this.form.recordId
            ? doUpdateRecord(this.form)
            : doCreateRecord(this.form))
          if (data.code !== 1) return
          this.dialogVisible = false
          this.$parent.getTableData()
          this.$msg.success(this.title + '解析记录成功')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 添加DNS表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
