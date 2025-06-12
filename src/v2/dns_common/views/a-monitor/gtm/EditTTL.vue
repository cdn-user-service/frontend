<template>
  <ants-dialog
    title="修改TTL"
    v-model="dialogVisible"
    width="400px"
    ref="dialogRef"
    @closed="closed"
    @submit="doSave"
  >
    <ants-form :model="form" :rules="rules" ref="formRef" label-width="60px">
      <ants-form-item label="TTL" prop="ttl">
        <ants-input-number
          v-model="form.ttl"
          :precision="0"
          :min="1"
          :max="86400"
          placeholder="TTL"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doSaveGtmTask } = require(`@/v2/${PROCESS_NAME}/api/dns/gtm`)

const rules = {
  ttl: [
    {
      required: true,
      message: '请输入TTL',
      trigger: ['change', 'blur']
    }
  ]
}

export default {
  components: {},
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      loading: false,

      form: {
        ttl: 600
      },
      rules,
      rowDetail: {}
    }
  },
  computed: {},
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.form.ttl = row.ttl
      this.rowDetail = {
        ...row
      }
    },

    // 保存
    async doSave() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return

        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doSaveGtmTask({
            ...this.rowDetail,
            ttl: this.form.ttl
          })
          if (res.code !== 1) return
          this.$msg.success('修改成功')
          this.$emit('refresh')
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 表单重置
    closed() {}
  }
}
</script>
