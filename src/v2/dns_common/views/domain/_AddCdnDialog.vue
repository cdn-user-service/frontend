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
      <ants-form-item prop="serialNumber">
        <ants-select
          v-model="form.serialNumber"
          :clearable="false"
          placeholder="请选择套餐"
          :loading="loading"
          class="query-user-select el-icon-box ants-select-bgc"
        >
          <ants-option
            v-for="item in planList"
            :key="item.serial_number"
            :label="item.productName"
            :value="item.serial_number"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item prop="sProtocol" style="margin:10px 0;">
        <strong class="mr-df text-ants-text-3">取源协议</strong>
        <ants-radio-group v-model="form.sProtocol">
          <ants-radio label="http" text="HTTP" />
          <ants-radio label="https" text="HTTPS" />
          <ants-radio label="$scheme" text="协议跟随" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item prop="mainServerName" style="margin-top:0;">
        <ants-input
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
const { doCreateCdnSite } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

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
        // 套餐ID
        serialNumber: '',
        // 站点
        mainServerName: '',
        // 取源协议
        sProtocol: 'http'
      },

      formRules: {
        serialNumber: [
          {
            required: true,
            message: '请选择套餐',
            trigger: ['change']
          }
        ],
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

      loading: false,
      planList: [],
      // CDN用户客户端
      ucdnAccessToken: '',

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
      this.rowData = {
        ...row
      }

      // 如果为管理端
      if (this.isAdmin) {
        const { userInfo = {} } = row
        this.ucdnAccessToken = userInfo.ucdnAccessToken
        if (!this.ucdnAccessToken) return
      } else {
        this.ucdnAccessToken = this.$root.userinfo.ucdnAccessToken
      }

      // 获取套餐列表
      this.getCdnPlan()
    },

    // 获取套餐列表
    async getCdnPlan() {
      this.loading = true
      try {
        const { data: res } = await requestOther({
          method: 'get',
          param: '',
          url: `${this.otherSite.apiRootPath}app/product/by_access/suit/listbyuser?access_token=${this.ucdnAccessToken}`
        })
        if (res.code !== 1) return
        const obj = JSON.parse(res.data || '{}')
        this.planList = obj.data || []
        if (this.planList.length) {
          this.form.serialNumber = this.planList[0].serial_number
        }
      } finally {
        this.loading = false
      }
    },

    // 表单提交
    async submitForm() {
      // 避免 keydown 时重复提交
      if (this.$refs.dialogRef.btnLoading) return

      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        try {
          const { serialNumber, mainServerName, sProtocol } = this.form
          const { data: res } = await requestOther({
            url: `${this.otherSite.apiRootPath}app/site/by_access/create`,
            method: 'post',
            param: JSON.stringify({
              access_token: this.ucdnAccessToken,
              serialNumber,
              sProtocol,
              // 站点，传递数组
              mainServerName: mainServerName.trim()
            })
          })

          if (res.code !== 1) return
          const obj = JSON.parse(res.data || '{}')
          if (obj.code !== 1) return this.$msg.error(obj.msg || '添加失败')
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

<style lang="scss">
.query-user-select {
  width: 100%;
  .el-input {
    width: 100% !important;
  }
}
.query-user-select.ants-select-bgc {
  .el-input__inner {
    border: 2px solid theme('colors.ants-bg-5');
    background-color: theme('colors.ants-bg-5');
    border-radius: 6px;
    line-height: 56px;
    height: 56px;
    padding-left: 45px;
  }
  .el-input__inner:focus {
    border-color: theme('colors.primary');
  }

  &::before {
    position: absolute;
    left: 20px;
    top: 18px;
    z-index: 1;
    font-size: 16px;
    color: #c0c4cc;
  }
}
</style>
