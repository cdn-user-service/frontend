<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('CDN客户端配置') }}</strong>
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      space-class="space-y-6"
      size="medium"
    >
      <ants-form-item prop="siteUrl">
        <span slot="label">
          <span>CDN客户端地址</span>
          <span class="text-error pl-sm">
            以 http(s):// 开头， 以 “/” 结尾。【如：https://www.cdn.com/users/】
          </span>
        </span>

        <ants-input v-model="form.siteUrl" placeholder="请输入" />
      </ants-form-item>

      <ants-form-item prop="apiRootPath">
        <span slot="label">
          <span>CDN客户端API接口请求根路径</span>
          <span class="text-error pl-sm">
            CDN客户端站点根路径 +
            {{ apiRoot }}【如：https://www.cdn.com{{ apiRoot }}】
          </span>
        </span>

        <ants-input v-model="form.apiRootPath" placeholder="请输入" />
      </ants-form-item>

      <ants-form-item prop="syncRegister" required>
        <span slot="label">
          <strong>CDN账号同步注册</strong>
          <span class="pl-sm text-ants-text-4 font-normal"
            >开启后新注册DNS系统账号将会同步注册CDN系统账号</span
          >
        </span>

        <ants-switch
          v-model="form.syncRegister"
          :active-value="1"
          :inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
        />
      </ants-form-item>

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
const resetAPI = (window.config || {}).resetAPI

const apiRoot = resetAPI ? '/api/' : '/antsxdp/'

export default {
  data() {
    return {
      params: {
        id: 31,
        key: 'CDN_USER_API_ROOT_URI',
        remark: 'CDN客户端路径'
      },
      apiRoot,

      btnLoading: false,
      switchLoading: false,

      status: 0, // 开关
      form: {
        siteUrl: '',
        apiRootPath: '',
        syncRegister: 0
      },

      formRules: {
        siteUrl: [
          {
            required: true,
            message: '请输入',
            trigger: ['change', 'blur']
          }
        ],
        apiRootPath: [
          {
            required: true,
            message: '请输入',
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
      this.form = {
        ...this.form,
        ...data
      }
      this.status = status
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
    }
  }
}
</script>
