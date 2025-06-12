<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('微信商户密钥信息配置') }}</strong>
      <a
        :href="`${$root.antsWebSite}/doc/94`"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm ml-lg"
        >查看配置文档 <span class="el-icon-paperclip"></span
      ></a>

      <div class="text-ants-text-4 text-sm mt-sm">
        这里配置为您自己申请的商户信息，需要业务方继承，请妥善保管，避免密钥泄露。
      </div>
    </div>

    <div class="p-lg bg-ants-bg-5 rounded-2xl mb-sm">
      <!-- <strong class="text-ants-text-3 mr-lg">开启微信支付</strong> -->
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
      <ants-form-item prop="appId">
        <span slot="label">
          <strong>APPID</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="绑定支付的APPID（必须配置，开户邮件中可查看）。"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input
          v-model="form.appId"
          placeholder="如：wxce65a9500000a655a7"
          :disabled="!status"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="mchId">
        <span slot="label">
          <strong>商户号（MCHID）</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="商户号（必须配置，开户邮件中可查看）"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input
          v-model="form.mchId"
          placeholder="如：1900009851"
          :disabled="!status"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="key">
        <span slot="label">
          <strong>商户支付密钥（KEY）</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="商户支付密钥，参考开户邮件设置，登录商户平台自行设置, 请妥善保管， 避免密钥泄露。。"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input
          v-model="form.key"
          :disabled="!status"
          placeholder="如：8934e7d15453e97507ef794cf7b0519d"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="secret">
        <span slot="label">
          <strong>APPSECRET</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="公众帐号secert（仅JSAPI支付的时候需要配置）， 请妥善保管， 避免密钥泄露。"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input
          v-model="form.secret"
          :disabled="!status"
          placeholder="如：7813490da6f1265e4901ffb80afaa36f"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="notifyUrl">
        <span slot="label">
          <strong>{{ antsT('回调地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">
            {{
              antsT(
                `请勿随意修改，格式：站点根路径 + ${apiRoot}app/pay/wechatPayCallback【如：${$root.demoWebSite}${apiRoot}app/pay/wechatPayCallback】`
              )
            }}</span
          >
        </span>
        <ants-input
          v-model="form.notifyUrl"
          :disabled="!status"
          placeholder="请输入回调地址"
        ></ants-input>
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
import { apiRoot } from '@/v2/cdn_admin/config'

const defaultForm = {
  appId: '',
  mchId: '',
  key: '',
  secret: '',

  certPath: '/work/apiclient_cert.p12',
  certData: [],
  configUtil: '1',

  // 回调 notifyUrl = http://dns.cdn.com/api/app/pay/wechatPayCallback,
  // 网站域名 + /api/app/pay/wechatPayCallback
  notifyUrl: ''
}
export default {
  data() {
    return {
      apiRoot,
      paramsId: 0,
      params: {
        id: 30,
        key: 'WXPAY_CONFIG_KEY',
        remark: '微信扫码支付'
      },

      btnLoading: false,
      switchLoading: false,

      status: 0, // 开关
      form: {
        ...defaultForm
      },

      formRules: {
        appId: [
          {
            required: true,
            message: 'APPID不能为空',
            trigger: ['change', 'blur']
          }
        ],
        mchId: [
          {
            required: true,
            message: '商户号不能为空',
            trigger: ['change', 'blur']
          }
        ],
        key: [
          {
            required: true,
            message: '商户支付密钥不能为空',
            trigger: ['change', 'blur']
          }
        ],
        secret: [
          {
            required: true,
            message: 'APPSECRET不能为空',
            trigger: ['change', 'blur']
          }
        ],
        notifyUrl: [
          {
            required: true,
            message: '请输入回调地址',
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
    /**
     * @description: 获取配置信息
     */

    async getConfig() {
      const { data, status } = await this.$root.getSystemConfigByParamKey(
        this.params.key
      )
      this.paramsId = data.id

      // 初始化的时候，回调地址为空，需要给个默认值
      const notifyUrl = this.debug
        ? `http://cdn20.cdn.com${apiRoot}app/pay/wechatPayCallback`
        : `${this.$root.webRootApi}app/pay/wechatPayCallback`

      this.form = {
        ...defaultForm,
        ...data,
        notifyUrl: data.notifyUrl || notifyUrl
      }
      this.status = status || 0
    },

    /**
     * @description: 点击保存配置
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true

        // 拼接 notifyUrl
        // const notifyUrl =
        //   this.debug
        //     ? 'http://cdn20.cdn.com/api/app/pay/wechatPayCallback'
        //     : `${this.$root.webRootApi}app/pay/wechatPayCallback`

        const paramValueJSON = JSON.stringify({
          ...this.form
          // notifyUrl
        })

        const { data: res } = await this.$root.updateSystemConfig({
          id: this.paramsId,
          paramKey: this.params.key,
          remark: this.params.remark,
          paramValue: paramValueJSON,
          status: this.status
        })
        this.btnLoading = false

        if (res.code !== 1) return
        this.$msg.success('保存配置成功')
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
            '该操作将会关闭微信支付功能，用户将不能进行微信支付。是否继续？',
          cancelInfo: '已取消关闭微信支付'
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
      this.$msg.success(`${!val ? '关闭' : '开启'}微信支付功能成功`)
    }
  }
}
</script>
