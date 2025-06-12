<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('API认证配置') }}</strong>
      <div class="text-ants-text-4 text-sm mt-sm">
        配置后将可用于API接口的授权验证
      </div>
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      space-class="space-y-6"
      size="medium"
    >
      <ants-form-item prop="appKey" label="AppKey">
        <span slot="label">
            <strong>AppKey</strong>
            <span class="text-primary cursor-pointer ml-lg el-icon-s-promotion"
            @click="randomKey"> 随机生成</span>
          </span>
        <ants-input
          v-model="form.appKey"
          maxlength="50"
          placeholder="输入AppKey"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="whiteIps" label="白名单IP，一行一个">
        <ants-input
          v-model="form.whiteIps"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 12 }"
          placeholder="输入白名单IP，一行一个"
        ></ants-input>
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
export default {
  data() {
    return {
      params: {
        id: 39,
        key: 'SYS_APP_LOGIN',
        remark: '登录认证'
      },

      btnLoading: false,
      switchLoading: false,

      status: 0, // 开关
      form: {
        // 随机字符串 Key, 必填
        appKey: '',
        // 白名单IP，非必填
        whiteIps: ''
      },

      formRules: {
        appKey: [
          {
            required: true,
            message: 'AppKey不能为空',
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

      const obj = data || {}
      this.params.id = data.id || 0
      
      if (obj.whiteIps && typeof obj.whiteIps === 'string') {
        obj.whiteIps = obj.whiteIps.replace(/,/g, '\n')
      }
      this.form = {
        ...this.form,
        ...obj
      }
      this.status = status
    },

    /**
     * @description: 点击随机生成
     */    
    randomKey() {
      const len = 30
      const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
      const maxPos = $chars.length
      let pwd = ''
      for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
      }
      this.form.appKey = pwd
    },

    /**
     * @description: 点击保存配置
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true

        const { data: res } = await this.$root.updateSystemConfig({
          id: this.params.id,
          paramKey: this.params.key,
          remark: this.params.remark,
          paramValue: JSON.stringify({
            appKey: this.form.appKey,
            whiteIps: this.form.whiteIps.trim().replace(/[\r\n]+/g, ',')
          })
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
          content: '该操作将会关闭登录认证配置。是否继续？',
          cancelInfo: '取消操作'
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
      this.$msg.success('操作成功')
    }
  }
}
</script>
