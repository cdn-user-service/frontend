<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="添加CDN站点"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      label-position="top"
    >
      <ants-form-item prop="sProtocol" style="margin-top: -10px;">
        <strong class="mr-df text-ants-text-3">取源协议</strong>
        <ants-radio-group v-model="form.sProtocol">
          <ants-radio label="http" text="HTTP" />
          <ants-radio label="https" text="HTTPS" />
          <ants-radio label="$scheme" text="协议跟随" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item prop="mainServerName">
        <ants-input
          ref="domainInputRef"
          is-bgc
          v-model="form.mainServerName"
          prefix-icon="aicon icon-wangluo"
          :placeholder="`${rowData.domain}|2.2.2.2|80`"
        />
      </ants-form-item>
      <div
        style="margin-top:20px;"
        class="text-ants-text-4 font-semibold leading-none"
      >
        格式说明：主站,别名1,别名2|源站IP|端口（不填则默认80/443）
      </div>
    </ants-form>
  </ants-dialog>
</template>

<script>
// 验证规则
import { isDomain, isIp, isPort } from '@/utils/validate'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { requestOther } = require(`@/v2/${PROCESS_NAME}/api/public`)

export default {
  components: {},
  data() {
    // 验证规则
    const checkDomains = (rule, value, callback) => {
      const itemTrim = value.trim()
      const itemTrimArr = itemTrim.split('|')
      // 站点别名
      const aliasArr = itemTrimArr[0].split(',')
      // 源站IP
      const ip = itemTrimArr[1]
      // 端口号
      let port = itemTrimArr[2]
      if (port === undefined) port = '80'

      // 判断站点格式是否正确
      const isOkDomain = aliasArr.every(item => isDomain(item))
      // 判断IP格式是否正确
      const isOkIp = isIp(ip)
      // 判断端口号格式是否正确
      const isOkPort = isPort(port)

      if (!isOkDomain) {
        callback(new Error('域名格式不正确：' + itemTrim))
        return
      }
      if (!isOkIp) {
        callback(new Error('源站IP格式不正确：' + itemTrim))
        return
      }
      if (!isOkPort) {
        callback(new Error('端口格式不正确：' + itemTrim))
        return
      }

      return callback()
    }

    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      form: {
        // 用户名，直接获取当前用户名
        userLabel: '',
        // 站点
        mainServerName: '',
        // 取源协议
        sProtocol: 'http'
      },

      formRules: {
        sProtocol: [
          {
            required: true,
            message: '请取源协议',
            trigger: ['change']
          }
        ],
        mainServerName: [
          {
            required: true,
            message: '请输入域名',
            trigger: ['change', 'blur']
          },
          {
            validator: checkDomains,
            trigger: 'blur'
          }
        ]
      },

      rowData: {}
    }
  },
  computed: {
    // CDN请求的路径
    otherSite({ $root }) {
      return $root.otherSite || {}
    }
  },
  methods: {
    show(row = {}) {
      this.dialogVisible = true
      this.form.mainServerName = `${row.domain}|2.2.2.2|80`
      this.form.userLabel = (row.userInfo || {}).username
      this.form.sProtocol = 'http'
      this.rowData = {
        ...row
      }

      this.$nextTick(() => {
        this.$refs.domainInputRef.$children[0].focus()
      })
    },

    // 表单提交
    async submitForm() {
      // 避免 keydown 时重复提交
      if (this.$refs.dialogRef.btnLoading) return

      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        try {
          const { mainServerName } = this.form
          const { data: res } = await requestOther({
            url: `${this.otherSite.apiRootPath}app/site/create/site/by/test`,
            method: 'post',
            param: JSON.stringify({
              ...this.form,
              mainServerName: mainServerName.trim()
            })
          })
          if (res.code !== 1) return
          const obj = JSON.parse(res.data || '{}')
          if (obj.code !== 1) {
            return this.$msg.error(obj.msg)
          }
          this.$msg.success('添加成功')
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 添加用户表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>

<style lang="scss"></style>
