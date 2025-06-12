<template>
  <div>
    <div class="ants-tips_box content-box">
      <span class="el-icon-info"></span>
      在配置微信扫码注册登录之前，在微信开放平台注册开发者帐号，并拥有一个已审核通过的网站应用，并获得相应的AppID和AppSecret。
    </div>
    <el-card class="content-box animated fadeIn" v-loading="$root.loading">
      <div slot="header">
        <strong>{{ antsT('微信扫码配置') }}</strong>
        <div class="text-ants-text-4 mt-xs text-sm">
          微信扫码配置将同时用于微信扫码登录、微信扫码注册。
        </div>
      </div>

      <div class="p-lg bg-ants-bg-3 rounded-2xl mb-xs switch-loading">
        <strong class="text-ants-text-3 mr-lg">开启微信扫码登录注册</strong>
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
              content="应用唯一标识，在微信开放平台提交应用审核通过后获得"
              placement="right"
            >
              <span class="el-icon-info ants-icon_info"></span>
            </el-tooltip>
          </span>
          <el-input
            v-model="form.appId"
            :disabled="!status"
            placeholder="输入APPID，如：wxbdc5610cc59c1631"
          ></el-input>
        </el-form-item>

        <el-form-item prop="appSecret">
          <span slot="label">
            <strong>AppSecret</strong>
            <el-tooltip
              class="item"
              effect="dark"
              content="应用密钥AppSecret，在微信开放平台提交应用审核通过后获得"
              placement="right"
            >
              <span class="el-icon-info ants-icon_info"></span>
            </el-tooltip>
          </span>
          <el-input
            v-model="form.appSecret"
            :disabled="!status"
            placeholder="输入应用密钥AppSecret"
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      params: {
        id: 7,
        key: 'WXLOGIN_CONFIG_KEY',
        remark: '微信扫码登录注册'
      },

      btnLoading: false,
      switchLoading: false,

      status: 0, // 开关
      form: {
        appId: '',
        appSecret: '',
        redirectUri: ''
      },

      formRules: {
        appId: [
          {
            required: true,
            message: 'APPID不能为空',
            trigger: ['change', 'blur']
          }
        ],
        appSecret: [
          {
            required: true,
            message: 'AppSecret不能为空',
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
      this.form = data || {}
      this.status = status
    },

    /**
     * @description: 点击保存配置
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        // 拼接 redirectUri
        const redirectUri = this.debug
          ? 'http://dns.antscdn.com/api/app/account/login/wechat/callback'
          : `${this.$root.webRootApi}app/account/login/wechat/callback`

        const paramValueJSON = JSON.stringify({
          ...this.form,
          redirectUri
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
            '该操作将会关闭微信扫码登录及注册功能，用户将不能进行微信扫码登录及注册。是否继续？',
          cancelInfo: '已取消关闭微信扫码登录注册功能'
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
      this.$msg.success(`${!val ? '关闭' : '开启'}微信扫码登录注册成功`)
    }
  }
}
</script>
