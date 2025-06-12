<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('通联支付配置') }}</strong>
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
      :disabled="!status" 
    > 
    <ants-form-item prop="EXCHANGE_RMB" style="margin-top: 0">
        <span slot="label">
          <strong>美元(USD)转人民币(CNY)汇</strong>
        </span>
        <ants-input-number
          size="medium"
          v-model="form.EXCHANGE_RMB"
          :precision="1"
          :step="1"
          :min="0.1"
          placeholder="汇率"
        />
      </ants-form-item>

      <ants-form-item prop="SYB_CUSID">
        <span slot="label">
          <strong>CUSID</strong>
        </span>
        <ants-input v-model="form.SYB_CUSID" placeholder="请输入CUSID" />
      </ants-form-item>

      <ants-form-item prop="SYB_APPID">
        <span slot="label">
          <strong>APPID</strong>
        </span>
        <ants-input v-model="form.SYB_APPID" placeholder="请输入APPID" />
      </ants-form-item>

      <ants-form-item prop="SYB_MD5_APPKEY">
        <span slot="label">
          <strong>MD5 APPKEY</strong>
        </span>
        <ants-input
          v-model="form.SYB_MD5_APPKEY"
          placeholder="请输入MD5 APPKEY"
        />
      </ants-form-item>

      <!-- <ants-form-item prop="SYB_SM2PPRIVATEKEY">
        <span slot="label">
          <strong>商户SM2私钥</strong>
          <span class="pl-sm font-normal text-sm">
            用于向通联发起请求前进行签名
          </span>
        </span>
        <ants-input
          v-model="form.SYB_SM2PPRIVATEKEY"
          placeholder="请输入商户SM2私钥"
        />
      </ants-form-item>

      <ants-form-item prop="SYB_SM2TLPUBKEY">
        <span slot="label">
          <strong>通联平台SM2公钥</strong>
          <span class="pl-sm font-normal text-sm">
            用于请求返回或者通联通知的验签
          </span>
        </span>
        <ants-input
          v-model="form.SYB_SM2TLPUBKEY"
          placeholder="请输入通联平台SM2公钥"
        />
      </ants-form-item> -->

      <ants-form-item prop="NOTIFY_URL">
        <span slot="label">
          <strong>{{ antsT('回调地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">
            {{
              antsT(
                `请勿随意修改，格式：站点根路径 + ${apiRoot}app/pay/allinpay/callback【如：${$root.demoWebSite}${apiRoot}app/pay/allinpay/callback】`
              )
            }}</span
          >
        </span>
        <ants-input v-model="form.NOTIFY_URL" placeholder="请输入回调地址" />
      </ants-form-item>

      <ants-form-item>
        <ants-button
          class="mt-sm"
          :loading="btnLoading"
          type="primary"
          @click="submitForm()"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
import { apiRoot } from '@/v2/cdn_admin/config'

const defaultForm = {
  // 汇率
  EXCHANGE_RMB: '7.2',
  SYB_CUSID: '',
  SYB_APPID: '',
  SYB_MD5_APPKEY: '',

  // 商户sm2私钥,用于向通联发起请求前进行签名
  SYB_SM2PPRIVATEKEY: '',
  // 通联平台sm2公钥，用于请求返回或者通联通知的验签
  SYB_SM2TLPUBKEY: '',

  // NOTIFY_UR: 'https://demo.antsxdp.com/antsxdp/app/pay/allinpay/callback',
  NOTIFY_URL: ''
}

const formRules = {
  EXCHANGE_RMB: [
    {
      required: true,
      message: '请输入汇率',
      trigger: ['change', 'blur']
    }
  ],
  SYB_CUSID: [
    {
      required: true,
      message: '请输入CUSID',
      trigger: ['change', 'blur']
    }
  ],
  SYB_APPID: [
    {
      required: true,
      message: '请输入APPID',
      trigger: ['change', 'blur']
    }
  ],
  SYB_MD5_APPKEY: [
    {
      required: true,
      message: '请输入MD5 APPKEY',
      trigger: ['change', 'blur']
    }
  ],
  SYB_SM2PPRIVATEKEY: [
    {
      required: true,
      message: '请输入商户SM2私钥',
      trigger: ['change', 'blur']
    }
  ],
  SYB_SM2TLPUBKEY: [
    {
      required: true,
      message: '请输入通联平台SM2公钥',
      trigger: ['change', 'blur']
    }
  ],
  NOTIFY_URL: [
    {
      required: true,
      message: '请输入回调地址',
      trigger: ['change', 'blur']
    }
  ]
}

export default {
  data() {
    return {
      apiRoot,
      paramsId: 0,
      params: {
        id: 67,
        key: 'ALLINPAY_PAY_CONF',
        remark: '通联支付配置'
      },

      btnLoading: false,
      switchLoading: false,

      status: 1, // 开关
      form: {
        ...defaultForm
      },

      formRules
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
      const NOTIFY_URL = this.debug
        ? `http://cdn20.cdn.com${apiRoot}app/pay/allinpay/callback`
        : `${this.$root.webRootApi}app/pay/allinpay/callback`

      this.form = {
        ...defaultForm,
        ...data,
        NOTIFY_URL: data.NOTIFY_URL || NOTIFY_URL
      }
      this.status = status || 0
    },

    // 点击保存配置
    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.btnLoading = true

        try {
          const paramValueJSON = JSON.stringify({
            ...this.form,
            SYB_ORGID: '',
            // 商户RSA私钥,用于向通联发起请求前进行签名 | 不传为空
            SYB_RSACUSPRIKEY: '',
            // 通联平台RSA公钥，用于请求返回或者通联通知的验签 | 不传为空
            SYB_RSATLPUBKEY: '',
            // 固定为 MD5 | SM2
            // SIGN_TYPE: 'MD5',
            // 测试环境 | 固定值
            SYB_APIURL: 'https://syb-test.allinpay.com/apiweb/unitorder'
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
