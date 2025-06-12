<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('支付宝商户密钥信息配置') }}</strong>
      <a
        :href="`${$root.antsWebSite}/doc/95`"
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
      <!-- <strong class="text-ants-text-3 mr-lg">开启支付宝支付</strong> -->
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
            content="支付宝分配给开发者的应用ID"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input
          v-model="form.appId"
          placeholder="如：2014072300007148"
          :disabled="!status"
        />
      </ants-form-item>

      <ants-form-item prop="alipayPublicKey">
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
        <ants-input
          v-model="form.alipayPublicKey"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 10 }"
          placeholder="请输入支付宝公钥"
          :disabled="!status"
        />
      </ants-form-item>

      <ants-form-item prop="privateKey">
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
        <ants-input
          v-model="form.privateKey"
          placeholder="请输入支付宝应用私钥"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 10 }"
          :disabled="!status"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="notifyUrl">
        <span slot="label">
          <strong>{{ antsT('回调地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">{{
            antsT(
              `请勿随意修改，格式：站点根路径 + ${apiRoot}app/pay/alipaynoticecallback【如：${$root.demoWebSite}${apiRoot}app/pay/alipaynoticecallback】`
            )
          }}</span>
        </span>
        <ants-input
          v-model="form.notifyUrl"
          :disabled="!status"
          placeholder="请输入回调地址"
        />
      </ants-form-item>

      <ants-form-item prop="returnUrl">
        <span slot="label">
          <strong>{{ antsT('支付成功后的跳转地址') }}</strong>
          <span class="ml-sm font-normal text-sm text-error">{{
            antsT(
              `请勿随意修改，格式：客户端站点访问根路径 + /#/cdn/finance/order/14【如：${$root.demoWebSite}/users/#/cdn/finance/order/14】`
            )
          }}</span>
        </span>
        <ants-input
          v-model="form.returnUrl"
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
  appId: '',
  privateKey: '', // 私钥
  alipayPublicKey: '', // 公钥

  // 支付成功跳转地址 http://dns.cdn.com/users/#/dns/finance/order/14
  returnUrl: '',

  // 回调 notifyUrl = http://dns.cdn.com/api/app/pay/alipaynoticecallback,
  // 网站域名 + /api/app/pay/alipaynoticecallback
  notifyUrl: ''
}
export default {
  data() {
    return {
      apiRoot,
      paramsId: 0,
      params: {
        id: 25,
        key: 'ALIPAY_CONFIG_KEY',
        remark: '阿里扫码支付配置'
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
      const { data, status } = await this.$root.getSystemConfigByParamKey(
        this.params.key
      )
      this.paramsId = data.id

      // 初始化的时候，回调地址为空，需要给个默认值
      const notifyUrl = this.debug
        ? `http://cdn20.cdn.com${apiRoot}app/pay/alipaynoticecallback`
        : `${this.$root.webRootApi}app/pay/alipaynoticecallback`

      // 拼接回调到前端的地址
      const SUCCESS_URL = 'cdn/finance/order/14'
      // 获取协议
      const { protocol } = getLocation()
      // 用户平台的 host + dir
      const { userDir } = this.$root.webConfig
      // 拼接
      const returnUrl = `${protocol}//${userDir}#/${SUCCESS_URL}`

      this.form = {
        ...defaultForm,
        ...data,
        notifyUrl: data.notifyUrl || notifyUrl,
        returnUrl: data.returnUrl || returnUrl
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
        // const CALL_BACK = 'app/pay/alipaynoticecallback'
        // const notifyUrl =
        //   this.debug
        //     ? `https://demo.api.com/api/${CALL_BACK}`
        //     : `${this.$root.webRootApi}${CALL_BACK}`

        // // 拼接回调到前端的地址
        // const SUCCESS_URL = 'cdn/finance/order/14'
        // // 获取协议
        // const { protocol } = getLocation()
        // // 用户平台的 host + dir
        // const { userDir } = this.$root.webConfig
        // // 拼接
        // const returnUrl = `${protocol}//${userDir}#/${SUCCESS_URL}`

        const paramValueJSON = JSON.stringify({
          ...this.form
          // notifyUrl,
          // returnUrl
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
        this.paramsId
      )
      this.switchLoading = false
      if (res.code !== 1) return
      this.$msg.success(`${!val ? '关闭' : '开启'}支付宝支付功能成功`)
    }
  }
}
</script>
