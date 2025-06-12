<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('支付宝商户密钥信息配置') }}</strong>
      <div class="text-ants-text-4 mt-xs text-sm">
        这里配置为您自己申请的商户信息，需要业务方继承，请妥善保管，避免密钥泄露。
      </div>
    </div>

    <div class="p-lg bg-ants-bg-3 rounded-2xl mb-xs switch-loading">
      <strong class="mr-lg text-ants-text-3">开启支付宝支付</strong>
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
            content="支付宝分配给开发者的应用ID"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <el-input
          v-model="form.appId"
          placeholder="如：2014072300007148"
          :disabled="!status"
        ></el-input>
      </el-form-item>

      <el-form-item prop="alipayPublicKey">
        <span slot="label">
          <strong>支付宝公钥（PublicKey）</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="请填写支付宝公钥，一行字符串"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <el-input
          v-model="form.alipayPublicKey"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 10 }"
          placeholder="请输入支付宝应用公钥"
          :disabled="!status"
        ></el-input>
      </el-form-item>

      <el-form-item prop="privateKey">
        <span slot="label">
          <strong>应用私钥（PrivateKey）</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="请填写支付宝应用私钥去头去尾去回车，一行字符串"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <el-input
          v-model="form.privateKey"
          placeholder="请输入支付宝应用私钥"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 10 }"
          :disabled="!status"
        ></el-input>
      </el-form-item>

      <el-form-item prop="notifyUrl">
        <span slot="label">
          <strong>{{ antsT('回调地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">{{
            antsT(
              `请勿随意修改，格式：站点根路径 + ${apiRoot}app/pay/alipaynoticecallback【如：${$root.demoWebSite}${apiRoot}app/pay/alipaynoticecallback】`
            )
          }}</span>
        </span>
        <el-input
          v-model="form.notifyUrl"
          :disabled="!status"
          placeholder="请输入回调地址"
        ></el-input>
      </el-form-item>

      <el-form-item prop="returnUrl">
        <span slot="label">
          <strong>{{ antsT('支付成功后的跳转地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">{{
            antsT(
              `请勿随意修改，格式：客户端站点访问根路径 + /#/dns/finance/order【如：${$root.demoWebSite}/users/#/dns/finance/order】`
            )
          }}</span>
        </span>
        <el-input
          v-model="form.returnUrl"
          :disabled="!status"
          placeholder="请输入支付成功后的跳转地址"
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
import { getLocation } from '@/utils/env'
import { apiRoot } from '@/v2/dns_admin/config'

const defaultForm = {
  appId: '',
  privateKey: '', // 私钥
  alipayPublicKey: '', // 公钥

  // 支付成功跳转地址 http://dns.antscdn.com/users/#/dns/finance/order
  returnUrl: '',

  // 回调 notifyUrl = http://dns.antscdn.com/api/app/pay/alipaynoticecallback,
  // 网站域名 + /api/app/pay/alipaynoticecallback
  notifyUrl: ''
}
export default {
  data() {
    return {
      apiRoot,
      params: {
        id: 4,
        key: 'ALIPAY_CONFIG_KEY',
        remark: '阿里扫码支付配置'
      },

      btnLoading: false,
      switchLoading: false,

      status: 0, // 开关
      form: {},

      formRules: {
        appId: [
          {
            required: true,
            message: 'APPID不能为空',
            trigger: ['change', 'blur']
          }
        ],
        privateKey: [
          {
            required: true,
            message: '支付宝应用私钥不能为空',
            trigger: ['change', 'blur']
          }
        ],
        alipayPublicKey: [
          {
            required: true,
            message: '支付宝公钥不能为空',
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
        returnUrl: [
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

      this.status = status

      // 初始化的时候，回调地址为空，需要给个默认值
      const notifyUrl = this.debug
        ? `http://dns.demo.com${apiRoot}app/pay/alipaynoticecallback`
        : `${this.$root.webRootApi}app/pay/alipaynoticecallback`

      // 拼接回调到前端的地址
      const SUCCESS_URL = 'dns/finance/order'
      // 获取协议
      const { protocol } = getLocation()
      // 用户平台的 host + dir
      // const { userDir } = this.$root.webConfig
      // 拼接
      const returnUrl = `${protocol}//users#/${SUCCESS_URL}`

      this.form = {
        ...defaultForm,
        ...data,
        notifyUrl: data.notifyUrl || notifyUrl,
        returnUrl: data.returnUrl || returnUrl
      }
    },
    /**
     * @description: 点击保存配置
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true

        // 拼接 notifyUrl
        // const CALL_BACK = 'app/pay/alipaynoticecallback'
        // const notifyUrl =
        //   this.debug
        //     ? `http://dns.antscdn.com/api/${CALL_BACK}`
        //     : `${this.$root.webRootApi}${CALL_BACK}`

        // //
        // const SUCCESS_URL = '/users/#/dns/finance/order'
        // const returnUrl =
        //   this.debug
        //     ? `http://dns.antscdn.com${SUCCESS_URL}`
        //     : `${this.$root.webRootSite}${SUCCESS_URL}`

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
            '该操作将会关闭支付宝支付功能，用户将不能进行支付宝支付。是否继续？',
          cancelInfo: '已取消关闭支付宝支付'
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
      this.$msg.success(`${!val ? '关闭' : '开启'}支付宝支付功能成功`)
    }
  }
}
</script>
