<template>
  <ants-dialog
    :title="title + '白名单'"
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
      label-width="80px"
    >
      <!-- 多个添加 -->
      <ants-form-item label="IP地址" prop="ip" v-if="!form.id">
        <ants-input
          type="textarea"
          v-model="form.ip"
          :autosize="{ minRows: 6, maxRows: 20 }"
          placeholder="请输入IP地址，一行一个"
          maxlength="1000"
        />
      </ants-form-item>

      <!-- 单个修改 -->
      <ants-form-item label="IP地址" prop="ip" v-else>
        <ants-input v-model.trim="form.ip" placeholder="请输入IP地址" />
      </ants-form-item>

      <ants-form-item label="备注信息" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
          maxlength="1000"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
const defaultForm = {
  id: 0,
  ip: '',
  // 回源请求头类型， 仅自定义时存在
  remark: ''
}

export default {
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      form: { ...defaultForm }
    }
  },
  computed: {
    formRules() {
        const { isIpv4, isIps } = this.$validator

      return {
        remark: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['change', 'blur']
          }
        ],
        ip: [
          {
            required: true,
            message: '请输入IP地址',
            trigger: ['change', 'blur']
          },
          {
            validator: this.form.id ? isIpv4() : isIps(true),
            trigger: 'blur'
          }
        ]
      }
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

    /**
     * @description: 添加提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { id, ip, remark } = this.form
        const ips = ip.trim().split(/[\r\n]+/)
        const arr = ips.map(item => {
          return {
            ip: item,
            id,
            remark
          }
        })

        const res = await this.$listeners.saveSiteAttr({
          server_waf_white_ip: arr
        })
        this.$refs.dialogRef.btnLoading = false
        if (!res) return
        this.$emit('refreshData')
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
