<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('Stripe支付配置') }}</strong>
      <!-- <a
        :href="`${$root.antsWebSite}/doc/94`"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm ml-lg"
        >查看配置文档 <span class="el-icon-paperclip"></span
      ></a>

      <div class="text-ants-text-4 text-sm mt-sm">
        这里配置为您自己申请的商户信息，需要业务方继承，请妥善保管，避免密钥泄露。
      </div> -->
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
      <ants-form-item prop="baseCurrency">
        <span slot="label">
          <strong>{{ antsT('货币类型') }}</strong>
        </span>
        <ants-radio-group v-model="form.baseCurrency" :disabled="!status">
          <ants-radio
            v-for="(item, key) in {
              cny: '人民币(CNY)',
              usd: '美元(USD)'
            }"
            :key="key"
            :label="key"
            :text="item"
          />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item prop="fxRate" v-if="form.baseCurrency == 'usd'">
        <span slot="label">
          <strong>美元(USD)转人民币(CNY)汇率</strong>
        </span>
        <ants-input-number
          size="medium"
          v-model="form.fxRate"
          :disabled="!status"
          :precision="1"
          :step="1"
          :min="0.1"
          placeholder="汇率"
        />
      </ants-form-item>

      <ants-form-item prop="apiKey" style="margin-top:0;">
        <span slot="label">
          <strong>API KEY</strong>
          <span class="pl-sm font-normal text-sm"
            >https://dashboard.stripe.com/apikeys 中的密钥</span
          >
          <!-- <el-tooltip
            class="item"
            effect="dark"
            content="https://dashboard.stripe.com/apikeys 中的密钥"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip> -->
        </span>
        <ants-input
          v-model="form.apiKey"
          placeholder="请输入 API KEY"
          :disabled="!status"
        />
      </ants-form-item>

      <ants-form-item prop="endpointSecret">
        <span slot="label">
          <strong>SECRET</strong>
          <span class="pl-sm font-normal text-sm">
            Webhooks 链接的密钥签名，首次保存请填0，可自动生成
          </span>
        </span>
        <ants-input
          v-model="form.endpointSecret"
          placeholder="请输入 SECRET"
          :disabled="!status"
        />
      </ants-form-item>

      <ants-form-item prop="webHookUrl">
        <span slot="label">
          <strong>{{ antsT('回调地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">
            {{
              antsT(
                `请勿随意修改，格式：站点根路径 + ${apiRoot}app/pay/stripe/callback【如：${$root.demoWebSite}${apiRoot}app/pay/stripe/callback】`
              )
            }}</span
          >
        </span>
        <ants-input
          v-model="form.webHookUrl"
          :disabled="!status"
          placeholder="请输入回调地址"
        />
      </ants-form-item>

      <ants-form-item prop="noticeUrl">
        <span slot="label">
          <strong>{{ antsT('支付成功后的跳转地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">{{
            antsT(
              `请勿随意修改，格式：客户端站点访问根路径 + /#/cdn/finance/order【如：${$root.demoWebSite}/users/#/cdn/finance/order】`
            )
          }}</span>
        </span>
        <ants-input
          v-model="form.noticeUrl"
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
import { apiRoot } from '@/v2/cdn_admin/config'

const defaultForm = {
  apiKey: '',
  endpointSecret: '',
  // 回调 webHookUrl = https://dns.cdn.com/api/app/pay/stripe/callback,
  // 网站域名 + /api/app/pay/wechatPayCallback
  webHookUrl: '',
  // 支付成功后的跳转地址 https://dns.cdn.com/users/#/dns/finance/order
  noticeUrl: '',
  // 货币，小写
  baseCurrency: 'cny',
  // 人民币转美元汇率
  fxRate: 7.3
}
export default {
  data() {
    return {
      apiRoot,
      paramsId: 0,
      params: {
        id: 62,
        key: 'STRIPE_PAY_CONF',
        remark: 'Stripe支付配置'
      },

      btnLoading: false,
      switchLoading: false,

      status: 0, // 开关
      form: {
        ...defaultForm
      },

      formRules: {
        fxRate: [
          {
            required: true,
            message: '美元(USD)转人民币(CNY)汇率',
            trigger: ['change', 'blur']
          }
        ],
        apiKey: [
          {
            required: true,
            message: '请输入 API KEY',
            trigger: ['change', 'blur']
          }
        ],
        endpointSecret: [
          {
            required: true,
            message: '请输入 SECRET',
            trigger: ['change', 'blur']
          }
        ],
        webHookUrl: [
          {
            required: true,
            message: '请输入回调地址',
            trigger: ['change', 'blur']
          }
        ],
        noticeUrl: [
          {
            required: true,
            message: '请输入支付成功后的跳转地址',
            trigger: ['change', 'blur']
          }
        ],
        baseCurrency: [
          {
            required: true,
            message: '请选择货币类型',
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
      const { data, status } = await this.$root.getSystemConfigByParamKey(
        this.params.key
      )
      this.paramsId = data.id

      // 初始化的时候，回调地址为空，需要给个默认值
      const webHookUrl = this.debug
        ? `http://cdn20.cdn.com${apiRoot}app/pay/stripe/callback`
        : `${this.$root.webRootApi}app/pay/stripe/callback`

      // 拼接回调到前端的地址
      const SUCCESS_URL = 'cdn/finance/order'
      // 获取协议
      const { protocol } = getLocation()
      // 用户平台的 host + dir
      const { userDir = 'users' } = this.$root.webConfig
      // 拼接
      const noticeUrl = `${protocol}//${userDir}#/${SUCCESS_URL}`

      this.form = {
        ...defaultForm,
        ...data,
        noticeUrl: data.noticeUrl || noticeUrl,
        webHookUrl: data.webHookUrl || webHookUrl
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
            id: this.paramsId,
            paramKey: this.params.key,
            remark: this.params.remark,
            paramValue: paramValueJSON,
          status: this.status
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
            '该操作将会关闭Stripe支付功能，用户将不能使用Stripe进行支付。是否继续？',
          cancelInfo: '已取消关闭'
        })
        if (!result) {
          this.status = 1
          return
        }
      }
      this.switchLoading = true
      const { data: res } = await this.$root.toggleSystemConfigStatus(
        this.paramsId
      )
      this.switchLoading = false
      if (res.code !== 1) return
      this.$msg.success(`${!val ? '关闭' : '开启'}成功`)
    }
  }
}
</script>
