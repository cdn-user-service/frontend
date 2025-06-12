<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('TokenPay支付配置') }}</strong>
    </div>

    <div class="p-lg bg-ants-bg-5 rounded-2xl mb-sm">
      <ants-switch
        v-model="status"
        :active-value="1"
        :inactive-value="0"
        active-text="ON"
        inactive-text="OFF"
        v-loading="switchLoading"
        @change="changeStatus"
      />
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      space-class="space-y-6"
      size="medium"
    >
      <ants-form-item prop="currency">
        <span slot="label">
          <strong>Currency</strong>
          <span class="ml-sm font-normal text-sm">
            加密货币的币种，支持USDT_TRC20、TRX等
          </span>
        </span>
        <ants-input
          v-model="form.currency"
          placeholder="请输入 Currency"
          :disabled="!status"
        />
      </ants-form-item>

      <ants-form-item prop="ApiToken">
        <span slot="label">
          <strong>API TOKEN</strong>
          <span class="ml-sm font-normal text-sm">
            异步通知密钥，请务必修改此密钥为随机字符串
          </span>
        </span>
        <ants-input
          v-model="form.ApiToken"
          placeholder="请输入 API TOKEN"
          :disabled="!status"
        />
      </ants-form-item>

      <ants-form-item prop="webSiteUrl">
        <span slot="label">
          <strong>WebSiteUrl</strong>
        </span>
        <ants-input
          v-model="form.webSiteUrl"
          placeholder="请输入 WebSiteUrl"
          :disabled="!status"
        />
      </ants-form-item>

      <ants-form-item prop="callBackUrl">
        <span slot="label">
          <strong>{{ antsT('回调地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">
            {{
              antsT(
                `请勿随意修改，格式：站点根路径 + ${apiRoot}app/pay/tokenpay/callback【如：${$root.demoWebSite}${apiRoot}app/pay/tokenpay/callback】`
              )
            }}</span
          >
        </span>
        <ants-input
          v-model="form.callBackUrl"
          :disabled="!status"
          placeholder="请输入回调地址"
        />
      </ants-form-item>

      <ants-form-item prop="redirectUrl">
        <span slot="label">
          <strong>{{ antsT('支付成功后的跳转地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">{{
            antsT(
              `请勿随意修改，格式：客户端站点访问根路径 + /#/dns/finance/order【如：${$root.demoWebSite}/users/#/dns/finance/order】`
            )
          }}</span>
        </span>
        <ants-input
          v-model="form.redirectUrl"
          :disabled="!status"
          placeholder="请输入支付成功后的跳转地址"
        />
      </ants-form-item>

      <ants-form-item>
        <ants-button
          class="mt-sm"
          :loading="btnLoading"
          type="primary"
          :disabled="!status"
          @click="submitForm"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
import { getLocation } from '@/utils/env'
import { apiRoot } from '@/v2/dns_admin/config'

const defaultForm = {
  currency: 'USDT_TRC20',
  webSiteUrl: '',
  ApiToken: '',
  // 回调 webHookUrl = https://dns.cdn.com/api/app/pay/stripe/callback,
  // 网站域名 + /api/app/pay/wechatPayCallback
  callBackUrl: '',
  // 支付成功后的跳转地址 https://dns.cdn.com/users/#/dns/finance/order
  redirectUrl: ''
}

export default {
  data() {
    return {
      apiRoot,
      paramsId: 0,
      params: {
        id: 30,
        key: 'TOKEN_PAY_CONF',
        remark: 'TokenPay支付配置'
      },

      btnLoading: false,
      switchLoading: false,

      status: 0, // 开关
      form: {
        ...defaultForm
      },

      formRules: {
        currency: [
          {
            required: true,
            message: '请输入 Currency',
            trigger: ['change', 'blur']
          }
        ],
        webSiteUrl: [
          {
            required: true,
            message: '请输入 WebSiteUrl',
            trigger: ['change', 'blur']
          }
        ],
        ApiToken: [
          {
            required: true,
            message: '请输入 API TOKEN',
            trigger: ['change', 'blur']
          }
        ],
        callBackUrl: [
          {
            required: true,
            message: '请输入回调地址',
            trigger: ['change', 'blur']
          }
        ],
        redirectUrl: [
          {
            required: true,
            message: '请输入支付成功后的跳转地址',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getConfig()
  },
  methods: {
    // 获取配置信息
    async getConfig() {
      const { data, status } = await this.$root.getSystemConfigByKey(
        this.params.key
      )
      this.paramsId = data.id || this.params.id

      // 初始化的时候，回调地址为空，需要给个默认值
      const callBackUrl = this.debug
        ? `http://dns20.dns.com${apiRoot}app/pay/tokenpay/callback`
        : `${this.$root.webRootApi}app/pay/tokenpay/callback`

      // 拼接回调到前端的地址
      const SUCCESS_URL = 'dns/finance/order'
      // 获取协议
      const { protocol } = getLocation()
      // 用户平台的 host + dir
      const { userDir = 'users' } = this.$root.webConfig
      // 拼接
      const redirectUrl = `${protocol}//${userDir}#/${SUCCESS_URL}`

      this.form = {
        ...defaultForm,
        ...data,
        redirectUrl: data.redirectUrl || redirectUrl,
        callBackUrl: data.callBackUrl || callBackUrl
      }
      this.status = status || 0
    },

    // 点击保存配置
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true

        try {
          const paramValueJSON = JSON.stringify({
            ...this.form
          })

          const { data: res } = await this.$root.updateSystemConfig({
            id: this.paramsId || this.params.id,
            paramKey: this.params.key,
            remark: this.params.remark,
            paramValue: paramValueJSON
          })

          if (res.code !== 1) return
          this.$msg.success('保存配置成功')
        } finally {
          this.btnLoading = false
        }
      })
    },

    /**
     * @description: 开关
     * @param {*} val
     */
    async changeStatus(val) {
      // 关闭
      if (!val) {
        const result = await this.$doDelete({
          title: '友情提示',
          content:
            '该操作将会关闭TokenPay支付功能，用户将不能使用TokenPay进行支付。是否继续？',
          cancelInfo: '已取消关闭'
        })
        if (!result) {
          this.status = 1
          return
        }
      }
      this.switchLoading = true
      const { data: res } = await this.$root.toggleSystemConfigStatus(
        this.paramsId || this.params.id
      )
      this.switchLoading = false
      if (res.code !== 1) return
      this.$msg.success(`${!val ? '关闭' : '开启'}成功`)
    }
  }
}
</script>
