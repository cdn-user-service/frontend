<template>
  <ants-dialog
    :title="title + 'IP黑名单'"
    ref="dialogRef"
    v-model="dialogVisible"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form :model="form" :rules="rules" ref="formRef" label-width="90px">
      <!-- 多个添加 -->
      <ants-form-item label="黑名单IP" prop="ip" v-if="!form.id">
        <ants-input
          type="textarea"
          v-model="form.ip"
          :autosize="{ minRows: 6, maxRows: 20 }"
          placeholder="请输入黑名单IP，一行一个"
          maxlength="1000"
        />
      </ants-form-item>

      <!-- 单个修改 -->
      <ants-form-item label="黑名单IP" prop="ip" v-else>
        <ants-input v-model.trim="form.ip" placeholder="请输入黑名单IP" />
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
  props: {
    // 是否为批量操作，为批量操作是不需要提交请求
    bulk: Boolean
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      form: { ...defaultForm }
    }
  },
  computed: {
    rules() {
      // const { isDomain, isDomains } = this.$validator
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
            message: '请输入黑名单IP',
            trigger: ['change', 'blur']
          },
          {
            validator: this.form.id ? isIpv4() : isIps(true),
            // validator: this.form.id ? isDomain('IP格式不正确') : isDomains('IP'),
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

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        const { id, ip, remark } = this.form
        const ips = ip.trim().split(/[\r\n]+/)
        const postArr = ips.map(item => {
          return {
            ip: item,
            id,
            remark
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
          server_waf_black_ip: postArr
        })
        if (!res) return
        this.$emit('refreshData')
        this.dialogVisible = false
      } finally {
        this.$refs.dialogRef.btnLoading = false
      }
    },

    // 提交方式二，输出数据，用于批量操作
    submitByData(postArr = []) {
      this.$emit('save', {
        isEdit: this.form.id,
        prop: 'server_waf_black_ip',
        data: postArr
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
