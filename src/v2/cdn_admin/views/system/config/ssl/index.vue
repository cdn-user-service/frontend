<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('SSL证书配置') }}</strong>
      <a
        href="https://app.zerossl.com/developer"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm ml-lg"
        >获取配置信息 <i class="el-icon-paperclip" />
      </a>
    </div>

    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-position="top"
      space-class="space-y-6"
      size="medium"
    >
      <ants-form-item prop="configId">
        <span slot="label">
          <span>首选接入方式</span>
        </span>

        <ants-radio-group v-model="form.configId" @change="changeType">
          <ants-radio :label="0" text="Letsencrypt" />
          <ants-radio :label="1" text="ZeroSSL" />
        </ants-radio-group>
      </ants-form-item>

      <template v-if="form.configId == 1">
        <div class="mt-lg">
          <TitleBorder class="mb-lg">
            <strong style="font-size:15px;">
              ZeroSSL API KEY
            </strong>
          </TitleBorder>
          <el-alert
            title="需要连接到ZeroSSL的 REST API。在受支持的 ACME 客户端中也需要。"
            type="info"
            show-icon
            :closable="false"
          />
        </div>

        <el-form-item>
          <span slot="label">
            <span>API KEY</span>
            <span class="text-ants-text-3 font-normal pl-sm">
              请填写从ZeroSSL获取到的 API KEY
            </span>
          </span>

          <ants-input v-model="form.api_key" placeholder="请输入API KEY" />
        </el-form-item>

        <div style="margin-top:30px;">
          <TitleBorder class="mb-lg">
            <strong style="font-size:15px;">
              EAB Credentials for ACME Clients
            </strong>
          </TitleBorder>

          <el-alert
            title="如果您使用的 ACME 客户端未与 ZeroSSL 集成，需要生成EAB（外部帐户绑定）凭据以将其连接到您的 ZeroSSL 帐户。"
            type="info"
            :closable="false"
            show-icon
          />
        </div>

        <el-form-item>
          <span slot="label">
            <span>EAB KID</span>
            <span class="text-ants-text-3 font-normal pl-sm">
              ACME客户的EAB凭证，登录ZeroSSL控制台后手动生成
            </span>
          </span>

          <ants-input v-model="form.eab_kid" placeholder="请输入EAB KID" />
        </el-form-item>

        <el-form-item>
          <span slot="label">
            <span>EAB HMAC KEY</span>
            <span class="text-ants-text-3 font-normal pl-sm">
              ACME客户的EAB凭证，登录ZeroSSL控制台后手动生成
            </span>
          </span>

          <ants-input
            v-model="form.eab_hmac_key"
            placeholder="请输入EAB HMAC KEY"
          />
        </el-form-item>
      </template>

      <div class="mt-lg" v-else>
        <el-alert
          title="将 Letsencrypt 作为首选的SSL证书接入配置。您也可以选择 ZeroSSL 作为首选的SSL证书接入配置。"
          type="info"
          show-icon
          :closable="false"
        />
      </div>

      <ants-form-item>
        <ants-button
          class="mt-sm"
          :loading="btnLoading"
          type="primary"
          @click="submitForm"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      params: {
        id: 66,
        key: 'ZERO_SSL_CONFIG',
        remark: 'SSL证书'
      },

      btnLoading: false,

      status: 0, // 开关
      form: {
        configId: 0, // default | api || eab
        api_key: '',
        eab_kid: '',
        eab_hmac_key: ''
      },

      rules: {
        configId: [
          {
            required: true,
            message: '请选择接入方式',
            trigger: ['change', 'blur']
          }
        ],
        api_key: [
          {
            required: true,
            message: '请输入API KEY',
            trigger: ['change', 'blur']
          }
        ],
        eab_kid: [
          {
            required: true,
            message: '请输入EAB KID',
            trigger: ['change', 'blur']
          }
        ],
        eab_hmac_key: [
          {
            required: true,
            message: '请输入EAB HMAC KEY',
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
      this.params.id = data.id
      this.form = {
        ...this.form,
        ...data,
        configId: data.configId || 0
      }
    },

    // 点击保存配置
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
          const { data: res } = await this.$root.updateSystemConfig({
            id: this.params.id,
            paramKey: this.params.key,
            remark: this.params.remark,
            paramValue: JSON.stringify(this.form)
          })

          if (res.code !== 1) return
          this.$msg.success('保存配置成功')
        } finally {
          this.btnLoading = false
        }
      })
    },

    changeType() {
      this.$refs.formRef.clearValidate()
    }
  }
}
</script>
