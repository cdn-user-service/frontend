<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('微信商户密钥信息配置') }}</strong>
      <div class="text-ants-text-4 mt-xs text-sm">
        这里配置为您自己申请的商户信息，需要业务方继承，请妥善保管，避免密钥泄露。
      </div>
    </div>

    <div class="p-lg bg-ants-bg-3 rounded-2xl mb-xs switch-loading">
      <strong class="mr-lg text-ants-text-3">开启微信支付</strong>
      <el-switch
        v-model="status"
        active-color="#02B340"
        :active-value="1"
        :inactive-value="0"
        @change="changeStatus"
        v-loading="switchLoading"
        element-loading-spinner="el-icon-loading"
      >
      </el-switch>
    </div>

    <el-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
      status-icon
      label-position="top"
    >
      <el-form-item prop="appId">
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
        <el-input
          v-model="form.appId"
          placeholder="如：wxce65a9500000a655a7"
          :disabled="!status"
        ></el-input>
      </el-form-item>

      <el-form-item prop="mchId">
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
        <el-input
          v-model="form.mchId"
          placeholder="如：1900009851"
          :disabled="!status"
        ></el-input>
      </el-form-item>

      <el-form-item prop="key">
        <span slot="label">
          <strong>商户支付密钥（KEY）</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="商户支付密钥，参考开户邮件设置，登录商户平台自行设置, 请妥善保管， 避免密钥泄露。"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <el-input
          v-model="form.key"
          :disabled="!status"
          placeholder="如：8934e7d15453e97507ef794cf7b0519d"
        ></el-input>
      </el-form-item>

      <el-form-item prop="secret">
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
        <el-input
          v-model="form.secret"
          :disabled="!status"
          placeholder="如：7813490da6f1265e4901ffb80afaa36f"
        ></el-input>
      </el-form-item>

      <el-form-item prop="notifyUrl">
        <span slot="label">
          <strong>{{ antsT('回调地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">{{
            antsT(
              `请勿随意修改，格式：站点根路径 + ${apiRoot}app/pay/wechatPayCallback【如：${$root.demoWebSite}${apiRoot}app/pay/wechatPayCallback】`
            )
          }}</span>
        </span>
        <el-input
          v-model="form.notifyUrl"
          :disabled="!status"
          placeholder="请输入回调地址"
        ></el-input>
      </el-form-item>

      <el-form-item prop="certPath">
        <span slot="label">
          <strong>{{ antsT('证书路径') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">{{
            antsT('微信退款功能需要')
          }}</span>
        </span>
        <el-input
          v-model="form.certPath"
          :disabled="!status"
          placeholder="请输入回调地址"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          size="small"
          :loading="btnLoading"
          type="primary"
          :disabled="!status"
          @click="submitForm"
          icon="el-icon-check"
          >保存配置</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { apiRoot } from '@/v2/dns_admin/config'

const defaultForm = {
  appId: '',
  mchId: '',
  key: '',
  secret: '',

  // 证书路径，微信退款需要的填写的
  certPath: '',
  certData: null,
  configUtil: '1',

  // 回调 notifyUrl = http://dns.antscdn.com/api/app/pay/wechatPayCallback,
  // 网站域名 + /api/app/pay/wechatPayCallback
  notifyUrl: ''
}
export default {
  data() {
    return {
      apiRoot,
      params: {
        id: 18,
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
        ],
        certPath: [
          {
            required: true,
            message: '请输入证书路径',
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
      // const { data, status } = await this.$root.getSystemConfigById(
      //   this.params.id
      // )

      const { data, status } = await this.$root.getSystemConfigByKey(
        this.params.key
      )

      // 初始化的时候，回调地址为空，需要给个默认值
      const notifyUrl = this.debug
        ? `http://dns.demo.com${apiRoot}app/pay/wechatPayCallback`
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
        //     ? 'http://dns.antscdn.com/api/app/pay/wechatPayCallback'
        //     : `${this.$root.webRootApi}app/pay/wechatPayCallback`

        const paramValueJSON = JSON.stringify({
          ...this.form
          // notifyUrl
        })

        const { data: res } = await this.$root.updateSystemConfig({
          id: this.params.id,
          paramKey: this.params.key,
          remark: this.params.remark,
          paramValue: paramValueJSON
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
        this.params.id
      )
      this.switchLoading = false
      if (res.code !== 1) return
      this.$msg.success(`${!val ? '关闭' : '开启'}微信支付功能成功`)
    }
  }
}
</script>
