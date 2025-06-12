<template>
  <ants-dialog
    :title="`${antsT('配置证书')}【${$route.query.domain}】`"
    v-model="dialogVisible"
    width="800px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
    ref="dialogRef"
  >
    <!-- <div class="text-center font-bold mb-lg -mt-sm">
      <el-tag type="primary" size="small">
        绑定域名：{{ $route.query.domain }}
      </el-tag>
    </div> -->

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      class="-mt-sm -mb-df"
      label-position="left"
      label-width="90px"
    >
      <ants-form-item label="可选证书" required>
        <ants-radio-group
          size="small"
          v-model="activeCert"
          @change="changeCert"
        >
          <ants-radio-button
            v-for="(item, key) in certObj"
            :key="key"
            :label="key"
            :text="item.remark"
          />
          <!-- <ants-radio-button :label="0" text="自定义" /> -->
        </ants-radio-group>

        <ants-button
          size="small"
          type="success"
          text="申请系统证书"
          class="ml-lg"
          icon="el-icon-s-promotion"
          :loading="btnLoading"
          v-if="(sysCertifyData.obj || {}).canReApplyMode != -1"
          @click="apliyCert"
        />
      </ants-form-item>

      <ants-form-item label="SSL_PEM" prop="other_ssl_pem">
        <ants-input
          style="font-size: 13px"
          type="textarea"
          v-model="form.other_ssl_pem"
          :autosize="{ minRows: 6, maxRows: 10 }"
          placeholder="PEM编码"
        />
      </ants-form-item>

      <ants-form-item label="SSL_KEY" prop="other_ssl_key">
        <ants-input
          style="font-size: 13px"
          type="textarea"
          v-model="form.other_ssl_key"
          :autosize="{ minRows: 6, maxRows: 10 }"
          placeholder="密钥KEY"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME

const {
  doReauthCertify,
  doApplyCert
} = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

// 后台重签证书用这个接口。前台用 doReauthCertify
const { pushByInputInfo } = require(`@/v2/${PROCESS_NAME}/api/cdn/push`)

// 表单初始化数据
const defaultForm = {
  other_ssl_key: '',
  other_ssl_pem: '',
  // 证书状态
  status: 0
}

export default {
  data() {
    return {
      // 是否为管理平台
      isAdmin: PROCESS_NAME === 'cdn_admin',

      dialogVisible: false,
      btnLoading: false,
      form: {
        ...defaultForm
      },

      formRules: {
        other_ssl_pem: [
          {
            required: true,
            message: '请输入PEM编码',
            trigger: ['change', 'blur']
          }
        ],
        other_ssl_key: [
          {
            required: true,
            message: '请输入密钥KEY',
            trigger: ['change', 'blur']
          }
        ]
      },

      // 当前选中的可选择证书索引
      activeCert: 0,
      // 可选择证书
      certObj: {},

      customObj: {},

      // 是否可申请证书
      sysCertifyData: {
        obj: {},
        arr: []
      }
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}, sysCertifyData = {}) {
      this.dialogVisible = true
      this.activeCert = 0
      this.certObj = {}
      this.sysCertifyData = sysCertifyData

      this.form = {
        ...defaultForm,
        ...row
      }

      this.doGetCertByHost(sysCertifyData)
    },

    /**
     * @description: 获取可用证书
     */

    async doGetCertByHost(sysCertifyData) {
      const obj = {}

      sysCertifyData.arr.forEach((item) => {
        const objInfo = (item.objInfo && JSON.parse(item.objInfo)) || {}
        obj[item.id] = {
          ...item,
          objInfo
        }

        // 1、如果当前已配置证书包含在获取到的证书列表中，则默认选中该证书
        if (objInfo.pem_cert.trim() == this.form.other_ssl_pem.trim()) {
          this.activeCert = item.id
        }
      })

      obj[0] = {
        id: 0,
        remark: '自定义',
        objInfo: {
          pem_cert: this.form.other_ssl_pem,
          private_key: this.form.other_ssl_key
        }
      }
      this.certObj = obj
      // if (!res.data.length) this.$msg.error('未查询到任何证书')
    },

    /**
     * @description: 证书切换
     */

    changeCert(val) {
      const { objInfo } = this.certObj[val]
      this.form.other_ssl_pem = objInfo.pem_cert
      this.form.other_ssl_key = objInfo.private_key
    },

    /**
     * @description: 添加业务分组 提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        try {
          const res = await this.$listeners.saveSiteAttr({
            other_ssl_pem: [{ value: this.form.other_ssl_pem }],
            other_ssl_key: [{ value: this.form.other_ssl_key }]
          })
          if (!res) return
          this.$emit('getSslData')
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 添加DNS表单重置
    resetForm() {
      this.form = defaultForm
      this.$refs.formRef.resetFields()
    },

    async apliyCert() {
      this.btnLoading = true
      try {
        const { data: res } = await doApplyCert({
          // 0 = 申请 | 1 = 重新申请
          mode: this.form.status || 0,
          siteId: this.$route.query.id
        })
        if (res.code !== 1) return
        this.$msg.success('证书申请已提交')
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>
