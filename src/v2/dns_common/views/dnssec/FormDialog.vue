<template>
  <ants-dialog
    title="添加 DNSSEC 记录"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="doSubmit"
  >
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="100px"
      :hide-required-asterisk="false"
    >
      <ants-form-item label="关键标签" prop="keyTag">
        <template #label>
          关键标签
          <el-tooltip
            content="用于标识域名的 DNSSEC 记录，请填写 0 ~ 65536 的整数值"
            placement="right"
          >
            <i class="el-icon-info text-primary text-df pl-1"></i>
          </el-tooltip>
        </template>
        <ants-input
          v-model.trim.number="form.keyTag"
          placeholder="请填写关键标签（0 ~ 65536）"
        />
      </ants-form-item>

      <ants-form-item label="加密算法" prop="digestType">
        <template #label>
          加密算法
          <el-tooltip content="选择生成签名的加密算法" placement="right">
            <i class="el-icon-info text-primary text-df pl-1"></i>
          </el-tooltip>
        </template>
        <ants-select v-model="form.digestType" placeholder="请选择加密算法">
          <el-option
            v-for="item in [
              'RSA/SHA1',
              'RSA/MD5',
              'DSA',
              'DSA-NSEC3-SHA1',
              'Diffie-Hellman'
            ]"
            :key="item"
            :label="item"
            :value="item"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="摘要类型" prop="keyType">
        <template #label>
          摘要类型
          <el-tooltip content="选择构建摘要的算法类型" placement="right">
            <i class="el-icon-info text-primary text-df pl-1"></i>
          </el-tooltip>
        </template>
        <ants-select v-model="form.keyType" placeholder="请选择摘要类型">
          <el-option
            v-for="item in ['SHA-1', 'SHA-256', 'MD5']"
            :key="item"
            :label="item"
            :value="item"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="摘要" prop="keyDigest">
        <template #label>
          摘要
          <el-tooltip
            content="填写从域名解析商处获取到的摘要内容"
            placement="right"
          >
            <i class="el-icon-info text-primary text-df pl-1"></i>
          </el-tooltip>
        </template>
        <ants-input v-model="form.keyDigest" placeholder="请填写摘要" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doSaveSec } = require(`@/v2/${PROCESS_NAME}/api/dns/dnssec`)

const defaultForm = {
  id: 0,
  // 关键标签：用于标识域名的 DNSSEC 记录，请填写小于 65536 的整数值
  keyTag: '',
  // 加密算法：选择生成签名的加密算法
  digestType: 'DSA/SHA1',
  // 摘要类型：选择构建摘要的算法类型
  keyType: 'SHA-1',
  // 摘要：填写从域名解析商处获取到的摘要内容
  keyDigest: ''
}

const rules = {
  keyTag: [
    {
      required: true,
      message: '请输入填写关键标签',
      trigger: ['change', 'blur']
    },
    {
      type: 'number',
      validator: (rule, value, callback) => {
        // 验证为 0 ~ 65536 的整数
        const newValue = Number(value)
        if (newValue >= 0 && newValue <= 65536) {
          return callback()
        }
        callback(new Error('请输入 0 ~ 65536 的整数'))
      },
      trigger: ['blur']
    }
  ],
  digestType: [
    {
      required: true,
      message: '请选择加密算法',
      trigger: 'change'
    }
  ],
  keyType: [
    {
      required: true,
      message: '请选择摘要类型',
      trigger: 'change'
    }
  ],
  keyDigest: [
    {
      required: true,
      message: '请填写摘要',
      trigger: ['change', 'blur']
    }
  ]
}
export default {
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      loading: false,
      form: {
        ...defaultForm
      },

      rules
    }
  },
  methods: {
    show(row = {}) {
      this.dialogVisible = true
    },

    // 表单提交
    doSubmit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doSaveSec(this.form)
          if (res.code !== 1) return
          this.$emits('refresh')
          this.$msg.success('添加成功')
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
