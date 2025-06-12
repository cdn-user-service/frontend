<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('彩虹易支付配置') }}</strong>
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
      <ants-form-item prop="interfaceAddress" style="margin-top:0;">
        <span slot="label">
          <strong>接口地址</strong>
        </span>
        <ants-input
          v-model="form.interfaceAddress"
          placeholder="请输入接口地址"
        />
      </ants-form-item>

      <ants-form-item prop="pId">
        <span slot="label">
          <strong>商户ID</strong>
        </span>
        <ants-input v-model="form.pId" placeholder="请输入商户ID" />
      </ants-form-item>

      <ants-form-item prop="secret">
        <span slot="label">
          <strong>密钥</strong>
        </span>
        <ants-input v-model="form.secret" placeholder="请输入密钥" />
      </ants-form-item>

      <ants-form-item prop="notify_url">
        <span slot="label">
          <strong>{{ antsT('回调地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">
            {{
              antsT(
                `请勿随意修改，格式：站点根路径 + ${apiRoot}app/pay/cccyun/callback【如：${$root.demoWebSite}${apiRoot}app/pay/cccyun/callback】`
              )
            }}</span
          >
        </span>
        <ants-input v-model="form.notify_url" placeholder="请输入回调地址" />
      </ants-form-item>

      <ants-form-item prop="return_url">
        <span slot="label">
          <strong>{{ antsT('支付成功后的跳转地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">{{
            antsT(
              `请勿随意修改，格式：客户端站点访问根路径 + /#/cdn/finance/order【如：${$root.demoWebSite}/users/#/cdn/finance/order】`
            )
          }}</span>
        </span>
        <ants-input
          v-model="form.return_url"
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
  // 接口地址
  interfaceAddress: '',
  // 商户ID
  pId: '',
  // 密钥
  secret: '',
  // 支付方式
  payType: 'alipay|wxpay|qqpay',
  // 回调 notify_url = https://dns.cdn.com/api/app/pay/cccyun/callback,
  notify_url: '',
  // 支付成功后的跳转地址 https://dns.cdn.com/users/#/dns/finance/order
  return_url: ''
}
export default {
  data() {
    return {
      apiRoot,
      paramsId: 0,
      params: {
        id: 64,
        key: 'CCCYUN_PAY_CONF',
        remark: '彩虹易支付配置'
      },

      btnLoading: false,
      switchLoading: false,

      status: 0, // 开关
      form: {
        ...defaultForm
      },

      formRules: {
        interfaceAddress: [
          {
            required: true,
            message: '请输入接口地址',
            trigger: ['change', 'blur']
          }
        ],
        pId: [
          {
            required: true,
            message: '请输入商户ID',
            trigger: ['change', 'blur']
          }
        ],
        secret: [
          {
            required: true,
            message: '请输入密钥',
            trigger: ['change', 'blur']
          }
        ],
        notify_url: [
          {
            required: true,
            message: '请输入回调地址',
            trigger: ['change', 'blur']
          }
        ],
        return_url: [
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
      const { data, status } = await this.$root.getSystemConfigByParamKey(
        this.params.key
      )
      this.paramsId = data.id

      // 初始化的时候，回调地址为空，需要给个默认值
      const notifyUrl = this.debug
        ? `http://cdn20.cdn.com${apiRoot}app/pay/cccyun/callback`
        : `${this.$root.webRootApi}app/pay/cccyun/callback`

      // 拼接回调到前端的地址
      const SUCCESS_URL = 'cdn/finance/order'
      // 获取协议
      const { protocol } = getLocation()
      // 用户平台的 host + dir
      const { userDir = 'users' } = this.$root.webConfig
      // 拼接
      const returnUrl = `${protocol}//${userDir}#/${SUCCESS_URL}`

      this.form = {
        ...defaultForm,
        ...data,
        return_url: data.return_url || returnUrl,
        notify_url: data.notify_url || notifyUrl
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

    // 开关
    async changeStatus(val) {
      // 关闭
      if (!val) {
        const result = await this.$doDelete({
          title: '友情提示',
          content:
            '该操作将会关闭彩虹易支付功能，用户将不能使用彩虹易支付进行支付。是否继续？',
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
