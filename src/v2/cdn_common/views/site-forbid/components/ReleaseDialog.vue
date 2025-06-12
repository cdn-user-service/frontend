<template>
  <ants-dialog
    title="指定解封IP"
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
      label-position="top"
      class="-mt-lg"
    >
      <ants-form-item label="IP地址，一行一个" prop="ips">
        <ants-input
          v-model="form.ips"
          placeholder="请输入IP地址，一行一个"
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 20 }"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
// 推送数据接口，用于节点初始化
const { doReleaseIps } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        ips: ''
      },

      formRules: {
        // 添加DNS对话框的规则
        ips: [
          {
            required: true,
            message: '请输入IP地址，一行一个',
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

    showDialog(row = {}) {
      this.dialogVisible = true
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return

        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doReleaseIps({
          ips: this.form.ips.trim().replace(/[\r\n]+/g, ',')
        })
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$parent.getTableData()
        this.$msg.success('解封成功')
        this.dialogVisible = false
      })
    },

    // 表单重置
    resetForm() {
      this.form.ips = ''
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
