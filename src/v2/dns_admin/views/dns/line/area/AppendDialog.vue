<template>
  <ants-dialog
    title="追加IP段"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="70px"
    >
      <ants-form-item label="IP段" prop="ipContent">
        <ants-input
          v-model="form.ipContent"
          maxlength="100"
          placeholder="IP段，如：1.1.1.1-2.2.2.2"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="备注" prop="info">
        <ants-input
          v-model="form.info"
          maxlength="2000"
          placeholder="请输入备注信息"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 12 }"
          show-word-limit
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateAclIp } from '@/v2/dns_admin/api/dns/line'

const defaultForm = {
  id: null,
  ipContent: '',
  info: '',
  code: null
}
export default {
  props: {},
  data() {
    // 验证规则多个 IP段，一行一个IP段
    const checkIpsArr = (rule, value, callback) => {
      const checkIps = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)[-]((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/

      if (!checkIps.test(value.trim())) {
        return callback(new Error('IP段格式错误'))
      }

      // 2、比较起始IP大小
      if (value && this.compareIp(value.trim())) {
        return callback(new Error('起始IP不能大于截止IP'))
      }
      callback()
    }

    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        ipContent: [
          {
            required: true,
            message: '请输入IP段，如：1.1.1.1-2.2.2.2',
            trigger: ['change', 'blur']
          },
          {
            validator: checkIpsArr,
            trigger: 'blur'
          }
        ],
        info: [
          {
            required: true,
            message: '备注信息不能为空',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    showDialog(row = {}) {
      this.dialogVisible = true
      this.form.code = row.code
      this.form.id = row.id
    },

    /**
     * @description: 添加提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const { data: res } = await doCreateAclIp({
          ipStartS: this.form.ipContent.split('-')[0],
          ipEndS: this.form.ipContent.split('-')[1],
          info: this.form.info,
          code: this.form.code
        })
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$msg.success('追加IP段成功')
        this.dialogVisible = false
      })
    },

    // 比较 IP段 大小
    compareIp(ip) {
      const ipArr = ip.split('-')
      if (this.ipGetInt(ipArr[0]) > this.ipGetInt(ipArr[1])) {
        return true
      } else {
        return false
      }
    },

    // ip 转整数
    ipGetInt(ip) {
      let num = 0
      if (!ip) {
        return num
      }
      ip = ip.trim().split('.')
      num =
        Number(ip[0]) * 256 * 256 * 256 +
        Number(ip[1]) * 256 * 256 +
        Number(ip[2]) * 256 +
        Number(ip[3])
      num = num >>> 0 // 这个很关键，不然可能会出现负数的情况
      return num
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
