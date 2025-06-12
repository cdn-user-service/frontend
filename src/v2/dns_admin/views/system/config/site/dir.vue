<template>
  <div class="animated fadeIn">
    <div class="ants-tips_box mb-lg">
      <span class="el-icon-info"></span>
      {{ antsT('注意：客户端的根目录务必跟实际存放文件的目录一致。') }}
    </div>
    <el-card v-loading="$root.loading">
      <div slot="header">
        <strong>{{ antsT('站点访问根目录配置') }}</strong>
        <div class="text-ants-text-4 text-sm mt-xs">
          {{ antsT('可任意配置站点的访问根目录，避免暴露系统后台地址。') }}
        </div>
      </div>

      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-position="top"
        space-class="space-y-8"
      >
        <ants-form-item prop="adminDir" label="管理端访问根目录">
          <ants-input
            v-model="form.adminDir"
            placeholder="请输入管理端访问根目录"
          />
        </ants-form-item>

        <ants-form-item prop="userDir" label="客户端访问根目录">
          <ants-input
            v-model="form.userDir"
            placeholder="请输入客户端访问根目录"
          />
        </ants-form-item>

        <ants-form-item prop="frontAddress" label="客户端地址">
          <span slot="label">
            <strong>{{ antsT('客户端地址') }}</strong>
            <span class="ml-sm font-normal text-sm"
              >【如：{{ $root.demoWebSite }}/users/】</span
            >
          </span>
          <ants-input
            v-model="form.frontAddress"
            placeholder="请输入客户端地址"
          />
        </ants-form-item>

        <ants-form-item prop="cdnApi" label="CDN系统请求API">
          <span slot="label">
            <strong>{{ antsT('CDN系统请求API') }}</strong>
            <span class="ml-sm font-normal text-sm"
              >【如：https://demo.antsxdp.com/antsxdp/】</span
            >
          </span>
          <ants-input
            v-model="form.cdnApi"
            placeholder="请输入CDN系统请求API"
          />
        </ants-form-item>

        <ants-form-item>
          <ants-button
            class="mt-sm"
            type="primary"
            :loading="btnLoading"
            @click="submitForm"
            text="保存配置"
          />
        </ants-form-item>
      </ants-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      paramsId: 0,
      params: {
        id: 38,
        key: 'WEB_DIR_CONF',
        remark: 'Web站点根目录配置'
      },
      btnLoading: false,
      form: {
        adminDir: '',
        userDir: '',
        frontAddress: '',
        cdnApi: ''
      },
      formRules: {
        adminDir: [
          {
            required: true,
            message: '请输入管理端访问根目录',
            trigger: ['change', 'blur']
          }
        ],
        userDir: [
          {
            required: true,
            message: '请输入客户端访问根目录',
            trigger: ['change', 'blur']
          }
        ],
        frontAddress: [
          {
            required: true,
            message: '请输入客户端地址',
            trigger: ['change', 'blur']
          }
        ],
        cdnApi: [
          {
            required: true,
            message: '请输入CDN系统请求API',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getData()
  },
  methods: {
    // 获取数据
    async getData() {
      const res = await this.$root.getSystemConfigByKey(this.params.key)
      this.paramsId = res.data.id

      this.form = {
        ...this.form,
        ...res.data
      }
    },

    // 提交数据
    async submitForm() {
      this.btnLoading = true

      const { data: res } = await this.$root.updateSystemConfig({
        id: this.paramsId,
        paramKey: this.params.key,
        remark: this.params.remark,
        paramValue: JSON.stringify(this.form)
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.$msg.success('保存配置成功')
    }
  }
}
</script>
